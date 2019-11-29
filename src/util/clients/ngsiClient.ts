import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CREATED, NO_CONTENT, UNAUTHORIZED, REQUEST_TOO_LONG, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import * as mongoose from 'mongoose';
import { Subscription } from './ngsiObjects/ngsiSubscription';
import { NgsiError } from './ngsiObjects/ngsiError';
import { env } from '../validateEnv';
import { StreamObservationType, hasSimpleResultPropName, resultTimePropName, belongsToPropName, IotStreamType, observesPropName } from '../iotObjects/ontology';
import { HttpException } from '../errorMiddleware';
import { AuthClient } from './authClient';
import { Entity } from './ngsiObjects/ngsiEntity';
import { BulkOperationResult } from './ngsiObjects/bulkOperationResult';
import { ProblemDetails, InternalErrorErrorType } from '../ngsi/datatypes/problemDetails';

export class NgsiClient {
    public static readonly Instance = new NgsiClient(env.BROKER_HOST);
    private readonly client: AxiosInstance;
    private readonly contentType: AxiosRequestConfig = { headers: { 'Content-Type': 'application/json' } };

    private constructor(brokerHost: string) {
        this.client = axios.create({
            baseURL: `${brokerHost}`,
            headers: {
                'Accept': 'application/ld+json'
            }
        });

        if (env.ENABLE_AUTH) {
            this.client.interceptors.request.use(async function (config) {
                try {
                    const token = await AuthClient.getToken(config.method, config.url as string);
                    config.headers['x-auth-token'] = token; // eslint-disable-line require-atomic-updates

                    return config;
                }
                catch (e) {
                    throw new HttpException(UNAUTHORIZED, 'Failed to get token', e);
                }
            }, (error: unknown) => Promise.reject(error));
        }
    }

    public async createStreamMetaSubscription(observableProperties: string[]): Promise<{ id: string }> {
        const reqData: Subscription = {
            id: (new mongoose.Types.ObjectId()).toHexString(),
            type: 'Subscription',
            entities: [
                {
                    type: IotStreamType
                }
            ],
            watchedAttributes: [
                observesPropName,
                'location'
            ],
            q: observableProperties.map(p => `${observesPropName}==${p}`).join('|'),
            notification: {
                endpoint: {
                    uri: `${env.PATTERN_HOST}/api/notification/stream`,
                    accept: 'application/json'
                },
                format: 'normalized',
                attributes: [
                    observesPropName,
                    'location'
                ]
            },
            '@context': [
                'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld'
            ]
        };

        const result = await this.client.post<Subscription>('/ngsi-ld/v1/subscriptions/', reqData, this.contentType);

        if (result.status !== CREATED) {
            throw new NgsiError(result.status, "Failed to create subscription")
        }

        const subscriptionPath = (result.headers.location as string).split('/');
        return { id: subscriptionPath[subscriptionPath.length - 1] };
    }


    public async createStreamObservationSubscription(streamIds: string[]): Promise<{ id: string }> {
        const reqData: Subscription = {
            id: (new mongoose.Types.ObjectId()).toHexString(),
            type: 'Subscription',
            entities: [
                {
                    type: StreamObservationType
                }
            ],
            watchedAttributes: [
                hasSimpleResultPropName,
                resultTimePropName,
                belongsToPropName
            ],
            q: streamIds.map(id => `${belongsToPropName}==${id}`).join('|'),
            notification: {
                endpoint: {
                    uri: `${env.PATTERN_HOST}/api/notification/observation`,
                    accept: 'application/json'
                },
                format: 'normalized',
                attributes: [
                    hasSimpleResultPropName,
                    resultTimePropName,
                    belongsToPropName
                ]
            },
            '@context': [
                'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld'
            ]
        };

        const result = await this.client.post<Subscription>('/ngsi-ld/v1/subscriptions/', reqData, this.contentType);

        if (result.status !== CREATED) {
            throw new NgsiError(result.status, "Failed to create subscription")
        }

        const subscriptionPath = (result.headers.location as string).split('/');
        return { id: subscriptionPath[subscriptionPath.length - 1] };
    }

    public async deleteSubscription(id: string): Promise<void> {
        const result = await this.client.delete(`/ngsi-ld/v1/subscriptions/${id}`);
        if (result.status !== NO_CONTENT) {
            throw new NgsiError(result.status, 'Failed to delete subscription');
        }
    }

    public async bulkCreateEntities(entities: Entity[]): Promise<BulkOperationResult> {
        const batchSize = env.ENABLE_BATCH_OPERATIONS ? 100 : entities.length;
        const nBatches = Math.ceil(entities.length / batchSize);

        const combinedResult: BulkOperationResult = {
            success: [],
            errors: []
        };
        for (let i = 0; i < nBatches; i++) {
            const batch = entities.slice(i * batchSize, (i + 1) * batchSize);
            const result = await this.createEntityBatch(batch);

            combinedResult.success.push(...(result.success || []));
            combinedResult.errors.push(...(result.errors || []));
        }

        console.info(`NGSI-CLIENT: [ALL] Created: ${combinedResult.success ? combinedResult.success.length : 0}, Failed: ${combinedResult.errors ? combinedResult.errors.length : 0}`);

        return combinedResult;
    }

    private async createEntityBatch(entities: Entity[]): Promise<BulkOperationResult> {
        try {
            if (env.ENABLE_BATCH_OPERATIONS) {
                const response = await this.client.post<BulkOperationResult>('/ngsi-ld/v1/entityOperations/create', entities, this.contentType);
                console.info(`NGSI-CLIENT: [${response.status}] Created: ${response.data.success ? response.data.success.length : 0}, Failed: ${response.data.errors ? response.data.errors.length : 0}`);
                return response.data;
            } else {
                const responses = await Promise.all(entities.map(async entity => {
                    try {
                        const response = await this.client.post('/ngsi-ld/v1/entities/', entity, this.contentType);
                        const entityPath = (response.headers.location as string).split('/');
                        return entityPath[entityPath.length - 1];
                    } catch (individualError) {
                        if (individualError.response) {
                            console.error(`NGSI-CLIENT: [${individualError.response.status}] ${JSON.stringify(individualError.response.data)}`);

                            return {
                                entityId: entity.id,
                                error: individualError.response.data as ProblemDetails
                            }
                        }

                        return {
                            entityId: entity.id,
                            error: {
                                type: InternalErrorErrorType,
                                title: 'Create request failed',
                                detail: individualError.message
                            } as ProblemDetails
                        };
                    }
                }));

                const result: BulkOperationResult = {
                    success: responses.filter(x => typeof x === 'string') as BulkOperationResult['success'],
                    errors: responses.filter(x => typeof x !== 'string') as BulkOperationResult['errors']
                };

                //console.info(`NGSI-CLIENT: [BATCH] Created: ${result.success ? result.success.length : 0}, Failed: ${result.errors ? result.errors.length : 0}`);

                return result;
            }
        } catch (error) {
            if (error.response) {
                if (error.response.errors) {
                    return error.response;
                }

                console.error(`NGSI-CLIENT: [${error.response.status}] ${JSON.stringify(error.response.data)}`);

                // If request was too long try to recursively split the request
                if (error.response.status === REQUEST_TOO_LONG) {
                    const mid = Math.ceil(entities.length / 2);

                    const partialResult = await Promise.all([
                        this.createEntityBatch(entities.slice(0, mid)),
                        this.createEntityBatch(entities.slice(mid)),
                    ]);

                    return {
                        success: partialResult[0].success.concat(partialResult[1].success),
                        errors: partialResult[0].errors.concat(partialResult[1].errors)
                    };
                }

                console.log('Failed to create entites: unknown error');
            } else if (error.request) {
                console.error('Failed to create entities: request timeout');
            } else {
                console.error('Failed to create entities: request failed');
            }
            throw error;
        }
    }

    public async bulkDeleteEntities(entityIds: string[]): Promise<BulkOperationResult> {
        const batchSize = env.ENABLE_BATCH_OPERATIONS ? 100 : entityIds.length;
        const nBatches = Math.ceil(entityIds.length / batchSize);

        const combinedResult: BulkOperationResult = {
            success: [],
            errors: []
        };
        for (let i = 0; i < nBatches; i++) {
            const batch = entityIds.slice(i * batchSize, (i + 1) * batchSize);
            const result = await this.deleteEntityBatch(batch);

            combinedResult.success.push(...(result.success || []));
            combinedResult.errors.push(...(result.errors || []));
        }

        console.info(`NGSI-CLIENT: [ALL] Deleted: ${combinedResult.success ? combinedResult.success.length : 0}, Failed: ${combinedResult.errors ? combinedResult.errors.length : 0} `);

        return combinedResult;
    }

    private async deleteEntityBatch(entityIds: string[]): Promise<BulkOperationResult> {
        try {
            if (env.ENABLE_BATCH_OPERATIONS) {
                const response = await this.client.post<BulkOperationResult>('/ngsi-ld/v1/entityOperations/delete', entityIds, this.contentType);
                console.info(`NGSI-CLIENT: [${response.status}] Deleted: ${response.data.success ? response.data.success.length : 0}, Failed: ${response.data.errors ? response.data.errors.length : 0}`);
                return response.data;
            } else {
                const responses = await Promise.all(entityIds.map(async id => {
                    try {
                        await this.client.delete(`/ngsi-ld/v1/entities/${id}`);
                        return id;
                    } catch (individualError) {
                        if (individualError.response) {
                            return {
                                entityId: id,
                                error: individualError.response.data as ProblemDetails
                            }
                        }

                        return {
                            entityId: id,
                            error: {
                                type: InternalErrorErrorType,
                                title: 'Delete request failed',
                                detail: individualError.message
                            } as ProblemDetails
                        };
                    }
                }));

                const result: BulkOperationResult = {
                    success: responses.filter(x => typeof x === 'string') as BulkOperationResult['success'],
                    errors: responses.filter(x => typeof x !== 'string') as BulkOperationResult['errors']
                };

                console.info(`NGSI-CLIENT: [BATCH] Deleted: ${result.success ? result.success.length : 0}, Failed: ${result.errors ? result.errors.length : 0}`);

                return result;
            }
        } catch (error) {
            if (error.response) {
                if (error.response.errors) {
                    return error.response;
                }

                console.error(`NGSI-CLIENT: [${error.response.status}] ${JSON.stringify(error.response.data)}`);

                // If request was too long try to recursively split the request
                if (error.response.status === REQUEST_TOO_LONG) {
                    const mid = Math.ceil(entityIds.length / 2);

                    const partialResult = await Promise.all([
                        this.deleteEntityBatch(entityIds.slice(0, mid)),
                        this.deleteEntityBatch(entityIds.slice(mid)),
                    ]);

                    return {
                        success: partialResult[0].success.concat(partialResult[1].success),
                        errors: partialResult[0].errors.concat(partialResult[1].errors)
                    };
                }

                console.log('Failed to delete entites: unknown error');
            } else if (error.request) {
                console.error('Failed to delete entities: request timeout');
            } else {
                console.error('Failed to delete entities: request failed');
            }
            throw error;
        }
    }
}