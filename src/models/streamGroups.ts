import * as mongoose from 'mongoose';
import { Model } from '../util/model';
import { LocationSchema } from './schemas/locationSchema';
import { Geometry } from '../util/clients/ngsiObjects/geoJson';

export interface StreamGroups {
    location: Geometry;
    streams: {
        _id: string;
        observes: string;
        subscriptionId: string;
    }[];
}

const StreamSchema = new mongoose.Schema<StreamGroups['streams'][0]>({
    _id: { type: String, required: true },
    observes: { type: String, required: true },
    subscriptionId: { type: String }
});

export const StreamGroups = new Model<StreamGroups>('StreamGroups', {
    location: { type: LocationSchema, required: true },
    streams: { type: [StreamSchema], required: true }
}, {
    schemaConf: (schema): void => {
        schema.index({ location: '2dsphere' });
        schema.index({ 'streams._id': 1 }, { unique: true });
    }
});
