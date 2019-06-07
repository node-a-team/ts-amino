import { TypeInfo } from "./options";
export declare const prefixBytesLen = 4;
export declare const disambBytesLen = 3;
export declare const disfixBytesLen: number;
export declare function nameToDisfix(name: string): {
    disambBytes: Uint8Array;
    prefixBytes: Uint8Array;
};
export declare function setTypeInfo(value: any, typeInfo: TypeInfo): void;
export declare function getTypeInfo(value: any): TypeInfo | undefined;
export declare function deferTypeInfo(info: TypeInfo, value: any, fieldKey: string, forJSON?: boolean): [TypeInfo, any];
