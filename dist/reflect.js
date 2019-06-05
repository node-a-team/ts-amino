"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var type_1 = require("./type");
/* TODO: var (
 *  timeType            = reflect.TypeOf(time.Time{})
 *  jsonMarshalerType   = reflect.TypeOf(new(json.Marshaler)).Elem()
 *  jsonUnmarshalerType = reflect.TypeOf(new(json.Unmarshaler)).Elem()
 *  errorType           = reflect.TypeOf(new(error)).Elem()
 *)
 */
function checkUnsafe(field) {
    if (field.fieldOptions.unsafe) {
        return;
    }
    switch (field.type) {
        case type_1.Type.Float32:
        case type_1.Type.Float64:
            throw new Error("floating point types are unsafe for ts-amino");
    }
}
exports.checkUnsafe = checkUnsafe;
// export function slide(bz:Uint8Array, n)
function typeToTyp3(type, opts) {
    switch (type) {
        case type_1.Type.Interface:
            return type_1.Typ3.ByteLength;
        case type_1.Type.Array:
        case type_1.Type.Slice:
            return type_1.Typ3.ByteLength;
        case type_1.Type.String:
            return type_1.Typ3.ByteLength;
        case type_1.Type.Struct:
        case type_1.Type.Map:
            return type_1.Typ3.ByteLength;
        case type_1.Type.Int64:
        case type_1.Type.Uint64:
            if (opts.binFixed64) {
                return type_1.Typ3.Byte8;
            }
            return type_1.Typ3.Varint;
        case type_1.Type.Int32:
        case type_1.Type.Uint32:
            if (opts.binFixed32) {
                return type_1.Typ3.Byte4;
            }
            return type_1.Typ3.Varint;
        case type_1.Type.Int16:
        case type_1.Type.Int8:
        case type_1.Type.Int:
        case type_1.Type.Uint16:
        case type_1.Type.Uint8:
        case type_1.Type.Uint:
        case type_1.Type.Bool:
            return type_1.Typ3.Varint;
        case type_1.Type.Float64:
            return type_1.Typ3.Byte8;
        case type_1.Type.Float32:
            return type_1.Typ3.Byte4;
        default:
            throw new Error("unsupported field type " + type);
    }
}
exports.typeToTyp3 = typeToTyp3;
//# sourceMappingURL=reflect.js.map