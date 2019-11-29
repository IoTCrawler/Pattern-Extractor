import { EntityBase, Entity } from "../clients/ngsiObjects/ngsiEntity";
import { StreamObservationType, belongsToPropName, hasSimpleResultPropName, resultTimePropName } from "./ontology";
import { RelationshipType, PropertyType } from '../clients/ngsiObjects/ngsiProperty';

export class StreamObservation extends EntityBase {
    public readonly type: typeof StreamObservationType;
    public readonly belongsTo: string;
    public readonly simpleResult: number;
    public readonly resultTime: Date;

    constructor(observation: Entity) {
        super(observation.id);
        this.type = StreamObservationType;
        this.belongsTo = (observation[belongsToPropName] as RelationshipType).object;
        this.simpleResult = (observation[hasSimpleResultPropName] as PropertyType<number>).value;
        this.resultTime = new Date((observation[resultTimePropName] as PropertyType<string>).value);
    }
}