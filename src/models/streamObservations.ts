import { Model } from '../util/model';

export interface StreamObservations {
    _id: string;
    streamId: string;
    observation: number;
    observedAt: Date;
}

export const StreamObservations = new Model<StreamObservations>('StreamObservations', {
    _id: { type: String, required: true },
    streamId: { type: String, required: true },
    observation: { type: Number, required: true },
    observedAt: { type: Date, expires: 65 * 60, default: (): number => Date.now() }
}, {
    schemaConf: schema => {
        schema.index({streamId: 1, observedAt: -1});
    }
});
