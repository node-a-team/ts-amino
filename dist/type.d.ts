export declare enum Type {
    Defined = 0,
    Bool = 1,
    Int = 2,
    Int8 = 3,
    Int16 = 4,
    Int32 = 5,
    Int64 = 6,
    Uint = 7,
    Uint8 = 8,
    Uint16 = 9,
    Uint32 = 10,
    Uint64 = 11,
    Float32 = 12,
    Float64 = 13,
    Array = 14,
    Map = 15,
    Slice = 16,
    String = 17,
    Struct = 18,
    Interface = 19
}
export declare enum Typ3 {
    Varint = 0,
    Byte8 = 1,
    ByteLength = 2,
    Byte4 = 5
}
export declare const Symbols: {
    typeInfo: symbol;
    typeToPropertyKey: symbol;
    decoratorTypeInfos: symbol;
    fieldTypeInfoMap: symbol;
};
export declare function typ3ToString(typ3: Typ3): string;
