"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var big_integer_1 = __importDefault(require("big-integer"));
// tslint:disable-next-line: no-submodule-imports
var buffer_1 = require("buffer/");
var codec_1 = require("./codec");
var Encoder = __importStar(require("./encoder"));
var reflect_1 = require("./reflect");
var type_1 = require("./type");
var varint_1 = require("./varint");
function encodeReflectBinary(info, value, fopts, bare) {
    var _a = codec_1.deferTypeInfo(info, value, ""), deferedInfo = _a[0], deferedValue = _a[1];
    // tslint:disable-next-line:no-parameter-reassignment
    info = deferedInfo;
    // tslint:disable-next-line:no-parameter-reassignment
    value = deferedValue;
    // TODO: check value is valid / not zero value
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
            return encodeReflectBinary(info, value, fopts, bare);
        }
    }
    switch (info.type) {
        case type_1.Type.Interface:
            return encodeReflectBinaryInterface(info, value, fopts, bare);
        case type_1.Type.Array:
            if (value instanceof Uint8Array ||
                (info.arrayOf && info.arrayOf.type === type_1.Type.Uint8)) {
                return encodeReflectBinaryByteArray(info, value, fopts);
            }
            return encodeReflectBinaryList(info, value, fopts, bare);
        case type_1.Type.Slice:
            if (value instanceof Uint8Array ||
                (info.arrayOf && info.arrayOf.type === type_1.Type.Uint8)) {
                return encodeReflectBinaryByteSlice(info, value, fopts);
            }
            return encodeReflectBinaryList(info, value, fopts, bare);
        case type_1.Type.Struct:
            return encodeReflectBinaryStruct(info, value, fopts, bare);
        case type_1.Type.Int64:
            if (fopts.binFixed64) {
                return Encoder.encodeInt64(value);
            }
            return Encoder.encodeUvarint(varint_1.constants.int64ToUint64(value));
        case type_1.Type.Int32:
            if (fopts.binFixed32) {
                return Encoder.encodeInt32(value);
            }
            return Encoder.encodeUvarint(varint_1.constants.int64ToUint64(value));
        case type_1.Type.Int16:
            return Encoder.encodeInt16(value);
        case type_1.Type.Int8:
            return Encoder.encodeInt8(value);
        case type_1.Type.Int:
            return Encoder.encodeUvarint(varint_1.constants.int64ToUint64(value));
        case type_1.Type.Uint64:
            if (fopts.binFixed64) {
                return Encoder.encodeUint64(value);
            }
            Encoder.encodeUvarint(value);
        case type_1.Type.Uint32:
            if (fopts.binFixed32) {
                return Encoder.encodeUint32(value);
            }
            return Encoder.encodeUvarint(value);
        case type_1.Type.Uint16:
            return Encoder.encodeUint16(value);
        case type_1.Type.Uint8:
            return Encoder.encodeUint8(value);
        case type_1.Type.Uint:
            return Encoder.encodeUvarint(value);
        case type_1.Type.Bool:
            return Encoder.encodeBool(value);
        case type_1.Type.Float64:
            throw new Error("not yet implemented");
        case type_1.Type.Float32:
            throw new Error("not yet implemented");
        case type_1.Type.String:
            return Encoder.encodeString(value);
        case type_1.Type.Defined:
            throw new Error("can't get a type from child object");
        default:
            throw new Error("unsupported type");
    }
}
exports.encodeReflectBinary = encodeReflectBinary;
function encodeReflectBinaryInterface(iinfo, value, fopts, bare) {
    if (!value) {
        return new Uint8Array(1); // 0x00
    }
    var cinfo = codec_1.getTypeInfo(value);
    if (!cinfo || !cinfo.concreteInfo || !cinfo.concreteInfo.registered) {
        throw new Error("Cannot encode unregistered concrete type");
    }
    var buf = buffer_1.Buffer.alloc(0);
    var needDisamb = false;
    if (iinfo.interfaceInfo &&
        iinfo.interfaceInfo.interfaceOptions.alwaysDisambiguate) {
        needDisamb = true;
    }
    // TODO: judge whether disamb is necessary https://github.com/tendermint/go-amino/blob/master/binary-encode.go#L211
    if (needDisamb) {
        buf = buffer_1.Buffer.concat([
            buffer_1.Buffer.alloc(1),
            buffer_1.Buffer.from(cinfo.concreteInfo.disamb)
        ]);
    }
    buf = buffer_1.Buffer.concat([buf, buffer_1.Buffer.from(cinfo.concreteInfo.prefix)]);
    buf = buffer_1.Buffer.concat([
        buf,
        buffer_1.Buffer.from(encodeReflectBinary(cinfo, value, fopts, true))
    ]);
    if (bare) {
        return buf;
    }
    return Encoder.encodeByteSlice(buf);
}
function encodeReflectBinaryByteArray(info, value, fopts) {
    return Encoder.encodeByteSlice(value);
}
function encodeReflectBinaryList(info, value, fopts, bare) {
    if (!info.arrayOf) {
        throw new Error("should set a type of array element");
    }
    var etype = info.arrayOf;
    var einfo = {
        type: etype.type,
        arrayOf: etype.arrayOf
    };
    var buf = buffer_1.Buffer.alloc(0);
    if (value.length > 0) {
        var deferedInfo = codec_1.deferTypeInfo(einfo, value[0], "")[0];
        einfo = deferedInfo;
        var typ3 = reflect_1.typeToTyp3(deferedInfo.type, fopts);
        if (typ3 !== type_1.Typ3.ByteLength) {
            for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                var v = value_1[_i];
                buf = buffer_1.Buffer.concat([
                    buf,
                    buffer_1.Buffer.from(encodeReflectBinary(einfo, v, fopts, false))
                ]);
            }
        }
        else {
            for (var _a = 0, value_2 = value; _a < value_2.length; _a++) {
                var v = value_2[_a];
                buf = buffer_1.Buffer.concat([
                    buf,
                    buffer_1.Buffer.from(encodeFieldNumberAndTyp3(fopts.binFieldNum, type_1.Typ3.ByteLength))
                ]);
                // TODO: handling default https://github.com/tendermint/go-amino/blob/master/binary-encode.go#L311
                var efopts = __assign({}, fopts, {
                    binFieldNum: 1
                });
                buf = buffer_1.Buffer.concat([
                    buf,
                    buffer_1.Buffer.from(encodeReflectBinary(einfo, v, efopts, false))
                ]);
            }
        }
    }
    if (bare) {
        return buf;
    }
    return Encoder.encodeByteSlice(buf);
}
function encodeReflectBinaryByteSlice(info, value, fopts) {
    return Encoder.encodeByteSlice(value);
}
function encodeReflectBinaryStruct(info, value, fopts, bare) {
    var buf = buffer_1.Buffer.alloc(0);
    switch (info.type) {
        // case Type.time:
        //  TODO
        default:
            if (!info.structInfo) {
                throw new Error("should set types of struct elements");
            }
            for (var _i = 0, _a = info.structInfo.fields; _i < _a.length; _i++) {
                var field = _a[_i];
                var _b = codec_1.deferTypeInfo(info, value, field.name), finfo = _b[0], frv = _b[1];
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
                if (!frv && !fopts.writeEmpty) {
                    continue;
                }
                if (Array.isArray(frv) && frv.length === 0 && !fopts.writeEmpty) {
                    continue;
                }
                // Case for unpacked list
                if ((finfo.type === type_1.Type.Array || finfo.type === type_1.Type.Slice) &&
                    !((finfo.arrayOf && finfo.arrayOf.type === type_1.Type.Uint8) ||
                        frv instanceof Uint8Array) &&
                    reflect_1.typeToTyp3(finfo.type, field.fieldOptions) === type_1.Typ3.ByteLength) {
                    buf = buffer_1.Buffer.concat([
                        buf,
                        buffer_1.Buffer.from(encodeReflectBinaryList(finfo, frv, field.fieldOptions, true))
                    ]);
                    continue;
                }
                // TODO: handling default https://github.com/tendermint/go-amino/blob/master/binary-encode.go#L404
                // TODO: handling unpacked list https://github.com/tendermint/go-amino/blob/master/binary-encode.go#L409
                buf = buffer_1.Buffer.concat([
                    buf,
                    buffer_1.Buffer.from(encodeFieldNumberAndTyp3(field.fieldOptions.binFieldNum, reflect_1.typeToTyp3(finfo.type, field.fieldOptions)))
                ]);
                buf = buffer_1.Buffer.concat([
                    buf,
                    buffer_1.Buffer.from(encodeReflectBinary(finfo, frv, field.fieldOptions, false))
                ]);
                // TODO: ??? https://github.com/tendermint/go-amino/blob/master/binary-encode.go#L431
            }
    }
    if (bare) {
        return buf;
    }
    return Encoder.encodeByteSlice(buf);
}
function encodeFieldNumberAndTyp3(num, typ3) {
    varint_1.constants.mustUint32(num);
    // tslint:disable-next-line: no-bitwise
    if ((typ3 & 0xf8) !== 0) {
        throw new Error("invalid Typ3 byte " + typ3);
    }
    // TODO: if num is greater than 1<<29-1, throw error
    // tslint:disable-next-line: no-bitwise
    var value64 = (num << 3) | typ3;
    return varint_1.uvarint.encode(big_integer_1.default(value64));
}
//# sourceMappingURL=binary-encode.js.map