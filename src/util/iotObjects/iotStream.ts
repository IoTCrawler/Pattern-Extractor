import { IotStreamType, observesPropName } from "./ontology";
import { Entity, EntityBase } from "../clients/ngsiObjects/ngsiEntity";
import { RelationshipType, PropertyType, GeoPropertyType } from "../clients/ngsiObjects/ngsiProperty";
import { Geometry } from "../clients/ngsiObjects/geoJson";

export class IotStream extends EntityBase {
    public readonly type: typeof IotStreamType;
    public readonly location: Geometry;
    public readonly observes: string;

    constructor(ngsiStream: Entity) {
        super(ngsiStream.id);
        this.type = IotStreamType;

        const locationValue = (ngsiStream['location'] as (PropertyType<string> | GeoPropertyType)).value;
        this.location = typeof locationValue === 'string' ? JSON.parse(locationValue) : locationValue;

        this.observes = (ngsiStream[observesPropName] as RelationshipType).object;
    }
}
