import { Type } from "./type";
export interface TypeInfo {
    type: Type;
    arrayOf?: Pick<TypeInfo, "type" | "arrayOf">;
    interfaceInfo?: InterfaceInfo;
    concreteInfo?: ConcreteInfo;
    structInfo?: StructInfo;
}
export interface InterfaceInfo {
    interfaceOptions: InterfaceOptions;
}
export interface InterfaceOptions {
    alwaysDisambiguate: boolean;
}
export interface ConcreteInfo {
    registered: boolean;
    name: string;
    disamb: Uint8Array;
    prefix: Uint8Array;
    aminoMarshalerMethod?: string;
    aminoMarshalPeprType?: Pick<TypeInfo, "type" | "arrayOf">;
}
export interface StructInfo {
    fields: FieldInfo[];
}
export interface FieldInfo {
    name: string;
    type: Type;
    arrayOf?: Pick<TypeInfo, "type" | "arrayOf">;
    index: number;
    fieldOptions: FieldOptions;
}
export declare function newFieldInfo(name: string, type: Type, index: number, arrayOf?: Pick<TypeInfo, "type" | "arrayOf">, options?: Partial<FieldOptions>): FieldInfo;
export interface FieldOptions {
    jsonName: string;
    jsonOmitEmpty: boolean;
    binFixed64: boolean;
    binFixed32: boolean;
    binFieldNum: number;
    unsafe: boolean;
    writeEmpty: boolean;
    emptyElements: boolean;
}
export declare function defaultFieldOptions(options: Partial<FieldOptions>): FieldOptions;
