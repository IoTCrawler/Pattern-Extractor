import { Geometry } from "./geoJson";

interface BasePropertyType {
    type: 'Property' | 'Relationship' | 'GeoProperty';
    datasetId?: string;
}

export interface PropertyType<T> extends BasePropertyType {
    type: 'Property';
    value: T extends string | number ? T : {
        type: string;
        value: T;
    };
}

export interface RelationshipType extends BasePropertyType {
    type: 'Relationship';
    object: string;
}

export interface GeoPropertyType extends BasePropertyType {
    type: 'GeoProperty';
    value: Geometry | string;
}

export type NgsiPropertyType<T> = PropertyType<T> | RelationshipType | GeoPropertyType;

export abstract class NgsiProperty implements BasePropertyType {
    public abstract readonly type: BasePropertyType['type'];

    public static parse<T>(prop: NgsiPropertyType<T>): Property<T> | Relationship | GeoProperty {
        switch (prop.type) {
            case 'Property':
                return new Property<T>(prop.value); // eslint-disable-line @typescript-eslint/no-use-before-define
            case 'Relationship':
                return new Relationship(prop.object); // eslint-disable-line @typescript-eslint/no-use-before-define
            case 'GeoProperty':
                return new GeoProperty(prop.value); // eslint-disable-line @typescript-eslint/no-use-before-define
            default:
                throw Error(`Unsupported property type`);
        }
    }
}

export class Property<T> extends NgsiProperty implements PropertyType<T>  {
    public readonly type: 'Property';
    public readonly value: PropertyType<T>['value']

    constructor(value: PropertyType<T>['value']) {
        super();
        this.type = 'Property';
        this.value = value;
    }
}

export class Relationship extends NgsiProperty implements RelationshipType {
    public readonly type: 'Relationship';
    public readonly object: string;
    public readonly datasetId?: string;

    constructor(object: string, datasetId?: string) {
        super();
        this.type = 'Relationship';
        this.object = object;
        this.datasetId = datasetId;
    }
}

export class GeoProperty extends NgsiProperty implements GeoPropertyType {
    public readonly type: 'GeoProperty';
    public readonly value: GeoPropertyType['value'];

    constructor(value: GeoPropertyType['value']) {
        super();
        this.type = 'GeoProperty';
        this.value = value;
    }
}