// Controller to handle notifications from Orion broker
// APIs should be passed as a callback to the Orion broker
import * as express from 'express';
import { Controller } from '../util/controller';
import { StreamObservation } from '../util/iotObjects/streamObservation';
import { PatternExtractorModel } from '../models/patternExtractorModel';
import { HttpException } from '../util/errorMiddleware';
import { OK, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { PatternExtractor } from '../util/clients/patternExtractorClient';
import { NgsiClient } from '../util/clients/ngsiClient';
import { Entity } from '../util/clients/ngsiObjects/ngsiEntity';
import { StreamObservationType, IotStreamType, EventType, labelPropName, windowStartPropName, windowEndPropName, detectedFromPropName } from '../util/iotObjects/ontology';
import { fillMissingData, MissingDataError } from '../util/dataHelpers';
import { IotStream } from '../util/iotObjects/iotStream';
import { StreamGroups } from '../models/streamGroups';
import { StreamObservations } from '../models/streamObservations';
import { ObjectId } from 'bson';
import { contextProp, ContextObject } from '../util/ngsi/datatypes/context';
import { Property, Relationship } from '../util/clients/ngsiObjects/ngsiProperty';
import * as jsonLD from '../util/ngsi/datatypes/jsonLD';
import { EventMapping } from '../models/eventMapping';

export class NotificationController implements Controller {
    public readonly path = '/notification';
    public readonly router = express.Router();

    constructor() {
        this.intializeRoutes();
    }

    private intializeRoutes(): void {
        this.router.post(`${this.path}/observation`, this.handleObservationNotification.bind(this));
        this.router.post(`${this.path}/stream`, this.handleNewStreamNotification.bind(this));
    }

    public async handleObservationNotification(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        const rawObservations: StreamObservation[] = [];

        // Parse data and split into streams
        for (const entity of ([] as Entity[]).concat(req.body.data || req.body)) {
            switch (entity.type) {
                case StreamObservationType:
                    rawObservations.push(new StreamObservation(entity));
                    break;
                default:
                    console.error(`Unrecognized entity type: ${entity.type}`);
            }
        }

        // Insert new Observations
        await StreamObservations.Model.insertMany(rawObservations.map(o => ({
            _id: o.id,
            streamId: o.belongsTo,
            observation: o.simpleResult,
            observedAt: o.resultTime
        })), { ordered: false });

        try {
            // TODO fix duplicated events, when 2 observations from the same group come in parallel (or at the same time)
            await Promise.all(rawObservations.map(async observation => {
                const streamGroup = await StreamGroups.Model.findOne({ 'streams._id': observation.belongsTo }).exec();
                if (!streamGroup) {
                    console.log(`'Observation ${observation.id} belongs to a stream ${observation.belongsTo} that does not exist`);
                    return;
                }

                // Find models where all ObservableProperties are observed by Streams in StreamGroup
                const models = await PatternExtractorModel.Model.find({ observableProperties: { $not: { $elemMatch: { $nin: streamGroup.streams.map(s => s.observes) } } } }).exec();

                // Process each model separately
                await Promise.all(models.map(async model => {
                    // TODO stream group can contain more than 1 stream for each observable property, make it work in that case
                    const streamIds = model.observableProperties.map(o => streamGroup.streams.find(s => s.observes === o)!._id); // eslint-disable-line @typescript-eslint/no-non-null-assertion
                    const observations = (await StreamObservations.Model.aggregate([
                        { $match: { streamId: { $in: streamIds }, observedAt: { $lte: observation.resultTime } } },
                        { $group: { _id: '$observedAt', data: { $push: { k: '$streamId', v: '$observation' } } } }, // group observations by date
                        { $sort: { _id: -1 } }, // sort observations from newest to oldest
                        { $project: { samples: { $arrayToObject: { $concatArrays: [streamIds.map(id => ({ k: id, v: null })), '$data'] } } } }, // explicitly set missing values to null
                        { $project: { samples: { $objectToArray: '$samples' } } }, // convert samples object to array of values (maintaining order of streamId)
                        { $group: { _id: null, samples: { $push: '$samples.v' }, observedAt: { $push: '$_id' } } }, // concatenate samples into 2D array ([date][stream])
                        { $project: { _id: 0, samples: { $slice: ['$samples', 12] }, observedAt: { $slice: ['$observedAt', 12] } } }
                    ]).exec())[0] as { samples: (number | null)[][]; observedAt: Date[] };

                    // Do not clusterize the latest sample if it is not complete
                    if (observations.samples[0].some(o => o === null)) {
                        observations.samples.shift();
                        observations.observedAt.shift();
                    }
                    let samples = observations.samples;

                    // We need 12 samples to run clustering, if we don't we need to wait for more samples
                    if (samples.length < 12) { return; }

                    // Fill missing data
                    try {
                        samples = fillMissingData(samples);
                    } catch (e) {
                        const msg = e instanceof MissingDataError ? `No samples available for stream: ${streamIds[e.sampleIndex]}. Unable to fill data.\nSamples:${samples}`
                            : e.message;
                        console.log(msg);
                        return;
                    }

                    // Extract patterns
                    let patterns: number[] = [];
                    try {
                        patterns = await PatternExtractor.clusterize(model.model, samples as number[][]);
                    } catch (e) {
                        console.log(`Failed to extract patterns: ${e.message}\nSamples: ${JSON.stringify(samples)}`);
                        throw new HttpException(INTERNAL_SERVER_ERROR, 'Failed to extract patterns', e);
                    }

                    // Create Stream Events and publish them to the broker
                    const events = ([] as Entity[]).concat(...patterns.map((p, i) => {
                        const event: Entity = {
                            id: `urn:ngsi-ld:Event:${new ObjectId()}`,
                            type: EventType,
                            [labelPropName]: new Property(model.labels[p]),
                            [windowStartPropName]: new Property({
                                [jsonLD.typeProp]: 'DateTime',
                                [jsonLD.valueProp]: observations.observedAt[i + 11].toISOString() as unknown
                            }),
                            [windowEndPropName]: new Property({
                                [jsonLD.typeProp]: 'DateTime',
                                [jsonLD.valueProp]: observations.observedAt[i].toISOString() as unknown
                            }),
                            [contextProp]: {}
                        };

                        // Event was detected from multiple streams, use attribute aliases to create 1..n relationship, and map them using @context
                        let context: { [prop: string]: ContextObject[''] } = {};
                        streamIds.forEach((s, i) => {
                            const propName = `detectedFrom#$${i + 1}`;
                            event[propName] = new Relationship(s, s);
                            context = {
                                ...context,
                                [propName]: {
                                    [jsonLD.typeProp]: jsonLD.idProp,
                                    [jsonLD.idProp]: detectedFromPropName
                                }
                            };
                        });
                        event[contextProp] = context;

                        return event;
                    }));

                    try {
                        await Promise.all([
                            // Publish events to NGSI-LD broker
                            NgsiClient.Instance.bulkCreateEntities(events),
                            // Save event mappings so that they can be deleted from the broker later
                            EventMapping.Model.insertMany(events.map((event, i) => ({
                                _id: event.id,
                                timestamp: observations.observedAt[i]
                            })), { ordered: false })
                        ]);
                    } catch (e) {
                        throw new HttpException(INTERNAL_SERVER_ERROR, 'Failed to publish events', e);
                    }
                }));
            }));
        } catch (e) {
            if (e instanceof HttpException) {
                return next(e);
            }
            return next(new HttpException(INTERNAL_SERVER_ERROR, 'Pattern extractor failed with unknown error', e));
        }

        res.status(OK).json({});
    }

    public async handleNewStreamNotification(req: express.Request, res: express.Response): Promise<void> {
        const iotStreams: IotStream[] = [];

        // Parse data
        for (const entity of ([] as Entity[]).concat(req.body.data || req.body)) {
            switch (entity.type) {
                case IotStreamType:
                    iotStreams.push(new IotStream(entity));
                    break;
                default:
                    console.error(`Unrecognized entity type: ${entity.type}`);
            }
        }

        await Promise.all(iotStreams.map(async stream => {
            await StreamGroups.Model.findOneAndUpdate({ 'streams._id': stream.id }, { $pull: { streams: { _id: stream.id } } }).exec();

            // Add stream to StreamGroup in the database
            await StreamGroups.Model.updateOne({
                $and: [
                    { location: { $geoIntersects: { $geometry: stream.location } } },
                    { location: stream.location },
                ]
            }, {
                $setOnInsert: {
                    location: stream.location
                },
                $push: {
                    streams: {
                        _id: stream.id,
                        observes: stream.observes
                    }
                }
            }, { upsert: true }).exec();
        }));

        res.status(OK).json({});
    }
}
