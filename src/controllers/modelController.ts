// Controller for managing brokers
import * as express from 'express';
import { OK, CREATED, INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND, NO_CONTENT } from 'http-status-codes';
import * as mongoose from 'mongoose';
import { Controller } from '../util/controller';
import { HttpException } from '../util/errorMiddleware';
import { NgsiClient } from '../util/clients/ngsiClient';
import { PatternExtractorModel, ModelRegistrationRequest } from '../models/patternExtractorModel';

export class ModelController implements Controller {
    public readonly path = '/model';
    public readonly router = express.Router();

    constructor() {
        this.intializeRoutes();
    }

    private intializeRoutes(): void {
        this.router.get(this.path, this.listModels.bind(this));
        this.router.post(this.path, this.registerModel.bind(this));
        this.router.get(`${this.path}/:id`, this.getModel.bind(this));
        this.router.delete(`${this.path}/:id`, this.deleteModel.bind(this));
    }

    public async listModels(_: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const modelList = await PatternExtractorModel.Model.find().exec();

            res.status(OK).json({
                count: modelList.length,
                result: modelList.map((x: InstanceType<typeof PatternExtractorModel.Model>) => x.toObject({ versionKey: false }))
            });
        } catch (e) {
            return next(new HttpException(INTERNAL_SERVER_ERROR, `Failed to retrieve Pattern Extractor Model from database: ${e.message}`, e));
        }
    }

    public async registerModel(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        const modelData: ModelRegistrationRequest = req.body;

        // Create subscription in the Broker to be notififed about any changes Streams that observe properties of the model
        let subscriptionId: string;
        try {
            const subscription = await NgsiClient.Instance.createStreamMetaSubscription(modelData.observableProperties);
            subscriptionId = subscription.id;
        } catch (e) {
            return next(new HttpException(INTERNAL_SERVER_ERROR, `Failed to subscribe to notifications from the broker: ${e.message}`, e));
        }

        // Save the registration in the database
        try {
            const model = new PatternExtractorModel.Model({
                observableProperties: modelData.observableProperties,
                model: Buffer.from(modelData.model, 'base64'),
                labels: modelData.labels,
                subscriptionId: subscriptionId
            });
            const result = await model.save();

            res.status(CREATED)
                .location(`${req.originalUrl}/${result.id}`)
                .json(result.toObject({ versionKey: false }));
        } catch (e) {
            return next(new HttpException(INTERNAL_SERVER_ERROR, `Failed to create Pattern Extractor Model in the database: ${e.message}`, e));
        }
    }

    public async getModel(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return next(new HttpException(BAD_REQUEST, `Requested 'id' is inavalid`));
        }
        const id = mongoose.Types.ObjectId(req.params.id);

        try {
            const model = await PatternExtractorModel.Model.findById(id).exec();
            if (!model) {
                return next(new HttpException(NOT_FOUND, `Model registration with id='${id}' does not exist`));
            }

            res.status(OK).json(model.toObject({ versionKey: false }));
        } catch (e) {
            return next(new HttpException(INTERNAL_SERVER_ERROR, `Failed to retrieve Pattern Extractor Model from database: ${e.message}`, e));
        }
    }

    public async deleteModel(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return next(new HttpException(BAD_REQUEST, `Requested 'id' is inavalid`));
        }
        const id = mongoose.Types.ObjectId(req.params.id);

        // Retrieve BrokerRegistration and delete a subscription from the broker
        try {
            const model = await PatternExtractorModel.Model.findById(id).exec();
            if (!model) {
                return next(new HttpException(NOT_FOUND, `Pattern Extractor Model with id='${id}' does not exist`));
            }

            await NgsiClient.Instance.deleteSubscription(model.subscriptionId);
        } catch (e) {
            return next(new HttpException(INTERNAL_SERVER_ERROR, `Failed to delete subscription from the broker: ${e.message}`, e));
        }

        // Delete Brokerregistration from DB
        try {
            await PatternExtractorModel.Model.deleteOne({ _id: id }).exec();
            res.sendStatus(NO_CONTENT);
        } catch (e) {
            return next(new HttpException(INTERNAL_SERVER_ERROR, `Failed to delete Pattern Extractor Model from database: ${e.message}`, e));
        }
    }
}
