import { FieldOptions, TypeInfo } from "./options";
import { Type } from "./type";
export declare function marshalBinaryBare<T = any>(value: T): Uint8Array;
export declare function marshalBinaryLengthPrefixed<T = any>(value: T): Uint8Array;
export declare function marshalJson<T = any>(value: T, space?: string | number): string;
export declare function registerConcrete(name: string, value: any): void;
export declare function registerStruct(value: any, info: Pick<TypeInfo, Exclude<keyof TypeInfo, "type" | "arrayOf">>): void;
export declare function registerType(value: any, info: Pick<TypeInfo, "type" | "arrayOf" | "concreteInfo">, propertyKey: string): void;
export declare function DefineType(): ClassDecorator;
export declare function DefineStruct(): ClassDecorator;
export declare function Concrete(name: string): ClassDecorator;
export declare function Property(type: Type, index?: number, arrayOf?: Pick<TypeInfo, "type" | "arrayOf">, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function Bool(index?: number, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function Int(index?: number, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function Int8(index?: number, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function Int16(index?: number, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function Int32(index?: number, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function Int64(index?: number, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function Uint(index?: number, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function Uint8(index?: number, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function Uint16(index?: number, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function Uint32(index?: number, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function Uint64(index?: number, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function Array(index: number | undefined, arrayOf: Pick<TypeInfo, "type" | "arrayOf">, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function Slice(index: number | undefined, arrayOf: Pick<TypeInfo, "type" | "arrayOf">, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function String(index?: number, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function Defined(index?: number, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function Interface(index?: number, fieldOptions?: Partial<FieldOptions>): PropertyDecorator;
declare function AminoMarshaler(type: Pick<TypeInfo, "type" | "arrayOf">): MethodDecorator;
export declare const Method: {
    AminoMarshaler: typeof AminoMarshaler;
};
export declare const Field: {
    Bool: typeof Bool;
    Int: typeof Int;
    Int8: typeof Int8;
    Int16: typeof Int16;
    Int32: typeof Int32;
    Int64: typeof Int64;
    Uint: typeof Uint;
    Uint8: typeof Uint8;
    Uint16: typeof Uint16;
    Uint32: typeof Uint32;
    Uint64: typeof Uint64;
    Array: typeof Array;
    Slice: typeof Slice;
    String: typeof String;
    Defined: typeof Defined;
    Interface: typeof Interface;
};
export {};