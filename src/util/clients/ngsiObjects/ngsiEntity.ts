import { NgsiPropertyType } from "./ngsiProperty";
import { contextProp, Context } from "../../ngsi/datatypes/context";

interface EntityBaseType {
    id: string;
    type: string;
    [contextProp]: Context;
}

export type Entity = EntityBaseType & {
    [property: string]: NgsiPropertyType<unknown> | NgsiPropertyType<string> | NgsiPropertyType<number> | string | Context;
}

export abstract class EntityBase implements EntityBaseType {
    public readonly id: string;
    public abstract readonly type: string;
    public readonly [contextProp]: Context;

    constructor(id: string, context: Context = ['https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld']) {
        this.id = id;
        this[contextProp] = context;
    }
}