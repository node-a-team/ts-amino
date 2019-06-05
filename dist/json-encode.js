"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line: no-submodule-imports
var buffer_1 = require("buffer/");
var codec_1 = require("./codec");
var type_1 = require("./type");
function encodeReflectJSON(info, value, fopts) {
    var _a = codec_1.deferTypeInfo(info, value, ""), deferedInfo = _a[0], deferedValue = _a[1];
    // tslint:disable-next-line:no-parameter-reassignment
    info = deferedInfo;
    // tslint:disable-next-line:no-parameter-reassignment
    value = deferedValue;
    // Write null if necessary
    if (!value) {
        return "null";
    }
    // TODO: handle time type
    // Handle override if value has marshalJSON method
    if (value.marshalJSON != null) {
        return value.marshalJSON();
    }
    if (info.concreteInfo) {
        var concreteInfo = info.concreteInfo;
        if (concreteInfo.aminoMarshalerMethod &&
            concreteInfo.aminoMarshalPeprType) {
            // tslint:disable-next-line:no-parameter-reassignment
            value = value[info.concreteInfo.aminoMarshalerMethod]();
            // tslint:disable-next-line:no-parameter-reassignment
            info = {
                type: concreteInfo.aminoMarshalPeprType.type,
                arrayOf: concreteInfo.aminoMarshalPeprType.arrayOf
            };
            return encodeReflectJSON(info, value, fopts);
        }
    }
    switch (info.type) {
        case type_1.Type.Interface:
            return encodeReflectJSONInterface(info, value, fopts);
        case type_1.Type.Array:
        case type_1.Type.Slice:
            return encodeReflectJSONList(info, value, fopts);
        case type_1.Type.Struct:
            return encodeReflectJSONStruct(info, value, fopts);
        // TODO: handle map https://github.com/tendermint/go-amino/blob/master/json-encode.go#L93
        case type_1.Type.Int64:
        case type_1.Type.Int:
            return "\"" + value + "\"";
        case type_1.Type.Uint64:
        case type_1.Type.Uint:
            return "\"" + value + "\"";
        case type_1.Type.Int32:
        case type_1.Type.Int16:
        case type_1.Type.Int8:
        case type_1.Type.Uint32:
        case type_1.Type.Uint16:
        case type_1.Type.Uint8:
            return JSON.stringify(value);
        case type_1.Type.Bool:
        case type_1.Type.String:
            return JSON.stringify(value);
        case type_1.Type.Float64:
            throw new Error("not yet implemented");
        case type_1.Type.Float32:
            throw new Error("not yet implemented");
        case type_1.Type.Defined:
            throw new Error("can't get a type from child object");
        default:
            throw new Error("unsupported type");
    }
}
exports.encodeReflectJSON = encodeReflectJSON;
function encodeReflectJSONInterface(iinfo, value, fopts) {
    if (!value) {
        return "null";
    }
    var cinfo = codec_1.getTypeInfo(value);
    if (!cinfo || !cinfo.concreteInfo || !cinfo.concreteInfo.registered) {
        throw new Error("Cannot encode unregistered concrete type");
    }
    var result = "{\"type\":\"" + cinfo.concreteInfo.name + "\",\"value\":";
    result += encodeReflectJSON(cinfo, value, fopts);
    result += "}";
    return result;
}
function encodeReflectJSONList(info, value, fopts) {
    // if null
    if (!value) {
        return "null";
    }
    // if type is byte array
    if (value instanceof Uint8Array ||
        (info.arrayOf && info.arrayOf.type === type_1.Type.Uint8)) {
        return buffer_1.Buffer.from(value).toString("base64");
    }
    if (!info.arrayOf) {
        throw new Error("should set a type of array element");
    }
    var etype = info.arrayOf;
    var einfo = {
        type: etype.type,
        arrayOf: etype.arrayOf
    };
    var result = "[";
    for (var i = 0; i < value.length; i++) {
        var v = value[i];
        result += encodeReflectJSON(einfo, v, fopts);
        // Add a comma if it isn't the last item.
        if (i !== value.length - 1) {
            result += ",";
        }
    }
    result += "]";
    return result;
}
function encodeReflectJSONStruct(info, value, fopts) {
    var result = "{";
    if (!info.structInfo) {
        throw new Error("should set types of struct elements");
    }
    var writeComma = false;
    // tslint:disable-next-line: forin
    for (var key in info.structInfo.fields) {
        var field = info.structInfo.fields[key];
        var _a = codec_1.deferTypeInfo(info, value, field.name), finfo = _a[0], frv = _a[1];
        if (finfo.concreteInfo) {
            var concreteInfo = finfo.concreteInfo;
            if (concreteInfo.aminoMarshalerMethod &&
                concreteInfo.aminoMarshalPeprType) {
                frv = frv[finfo.concreteInfo.aminoMarshalerMethod]();
                finfo = {
                    type: concreteInfo.aminoMarshalPeprType.type,
                    arrayOf: concreteInfo.aminoMarshalPeprType.arrayOf
                };
            }
        }
        // TODO: handling omit empty https://github.com/tendermint/go-amino/blob/master/json-encode.go#L301
        if (writeComma) {
            result += ",";
            writeComma = false;
        }
        var name_1 = key;
        if (field.fieldOptions.jsonName) {
            name_1 = field.fieldOptions.jsonName;
        }
        result += JSON.stringify(name_1);
        result += ":";
        result += encodeReflectJSON(finfo, frv, fopts);
        writeComma = true;
    }
    result += "}";
    return result;
}
//# sourceMappingURL=json-encode.js.map