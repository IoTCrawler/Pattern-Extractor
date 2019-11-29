import { Model } from '../util/model';

export interface EventMapping {
    _id: string;
    timestamp: Date;
}

export const EventMapping = new Model<EventMapping>('EventMapping', {
    _id: { type: String },
    timestamp: { type: Date, required: true }
}, {
    schemaConf: (schema): void => {
        schema.index({ 'timestamp': 1, '_id': 1 });
    }
});
