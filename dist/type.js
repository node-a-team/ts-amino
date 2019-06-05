"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Type;
(function (Type) {
    Type[Type["Defined"] = 0] = "Defined";
    Type[Type["Bool"] = 1] = "Bool";
    Type[Type["Int"] = 2] = "Int";
    Type[Type["Int8"] = 3] = "Int8";
    Type[Type["Int16"] = 4] = "Int16";
    Type[Type["Int32"] = 5] = "Int32";
    Type[Type["Int64"] = 6] = "Int64";
    Type[Type["Uint"] = 7] = "Uint";
    Type[Type["Uint8"] = 8] = "Uint8";
    Type[Type["Uint16"] = 9] = "Uint16";
    Type[Type["Uint32"] = 10] = "Uint32";
    Type[Type["Uint64"] = 11] = "Uint64";
    Type[Type["Float32"] = 12] = "Float32";
    Type[Type["Float64"] = 13] = "Float64";
    Type[Type["Array"] = 14] = "Array";
    Type[Type["Map"] = 15] = "Map";
    Type[Type["Slice"] = 16] = "Slice";
    Type[Type["String"] = 17] = "String";
    Type[Type["Struct"] = 18] = "Struct";
    Type[Type["Interface"] = 19] = "Interface";
})(Type = exports.Type || (exports.Type = {}));
var Typ3;
(function (Typ3) {
    Typ3[Typ3["Varint"] = 0] = "Varint";
    Typ3[Typ3["Byte8"] = 1] = "Byte8";
    Typ3[Typ3["ByteLength"] = 2] = "ByteLength";
    // Struct = 3,
    // StructTerm = 4,
    Typ3[Typ3["Byte4"] = 5] = "Byte4";
    // List = 6,
    // Interface = 7,
})(Typ3 = exports.Typ3 || (exports.Typ3 = {}));
// tslint:disable-next-line:variable-name
exports.Symbols = {
    typeInfo: Symbol("typeInfo"),
    typeToPropertyKey: Symbol("typeToPropertyKey"),
    decoratorTypeInfos: Symbol("decoratorTypeInfos"),
    fieldTypeInfoMap: Symbol("fieldTypeInfoMap")
};
function typ3ToString(typ3) {
    switch (typ3) {
        case Typ3.Varint:
            return "(U)Varint";
        case Typ3.Byte8:
            return "8Byte";
        case Typ3.ByteLength:
            return "ByteLength";
        // case Typ3_Struct:
        //  return "Struct"
        // case Typ3_StructTerm:
        // 	return "StructTerm"
        case Typ3.Byte4:
            return "4Byte";
        // case Typ3_List:
        // 	return "List"
        // case Typ3_Interface:
        // 	return "Interface"
        default:
            return "<Invalid Typ3 " + typ3 + ">";
    }
}
exports.typ3ToString = typ3ToString;
//# sourceMappingURL=type.js.map