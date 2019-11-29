import { Model } from '../util/model';

export interface ModelRegistrationRequest {
    observableProperties: string[];
    model: string;
    labels: string[];
}

export interface PatternExtractorModel {
    observableProperties: string[];
    model: Buffer;
    labels: string[];
    subscriptionId: string;
}

export const PatternExtractorModel = new Model<PatternExtractorModel>('PatternExtractorModel', {
    observableProperties: { type: [String], required: true, index: true },
    model: { type: Buffer, required: true },
    labels: { type: [String], required: true },
    subscriptionId: {type: String, required: true, unique: true}
});
