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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line: no-submodule-imports
var buffer_1 = require("buffer/");
var BinaryEncoder = __importStar(require("./binary-encode"));
var codec_1 = require("./codec");
var Encoder = __importStar(require("./encoder"));
var JsonEncoder = __importStar(require("./json-encode"));
var options_1 = require("./options");
var type_1 = require("./type");
function marshalBinaryBare(value) {
    if (!value) {
        throw new Error("value is null");
    }
    if (typeof value !== "object") {
        throw new Error("only support object");
    }
    var typeInfo = codec_1.getTypeInfo(value);
    if (!typeInfo) {
        throw new Error("type info should be set");
    }
    var bz = BinaryEncoder.encodeReflectBinary(typeInfo, value, options_1.defaultFieldOptions({ binFieldNum: 1 }), true);
    if (typeInfo.concreteInfo && typeInfo.concreteInfo.registered) {
        bz = buffer_1.Buffer.concat([
            buffer_1.Buffer.from(typeInfo.concreteInfo.prefix),
            buffer_1.Buffer.from(bz)
        ]);
    }
    return bz;
}
exports.marshalBinaryBare = marshalBinaryBare;
function marshalBinaryLengthPrefixed(value) {
    var bz = marshalBinaryBare(value);
    bz = buffer_1.Buffer.concat([
        buffer_1.Buffer.from(Encoder.encodeUvarint(bz.length)),
        buffer_1.Buffer.from(bz)
    ]);
    return bz;
}
exports.marshalBinaryLengthPrefixed = marshalBinaryLengthPrefixed;
function marshalJson(value, space) {
    if (!value) {
        throw new Error("value is null");
    }
    if (typeof value !== "object") {
        throw new Error("only support object");
    }
    var typeInfo = codec_1.getTypeInfo(value);
    if (!typeInfo) {
        throw new Error("type info should be set");
    }
    var result = "";
    if (typeInfo.concreteInfo && typeInfo.concreteInfo.registered) {
        result = "{\"type\":\"" + typeInfo.concreteInfo.name + "\",\"value\":";
    }
    result += JsonEncoder.encodeReflectJSON(typeInfo, value, options_1.defaultFieldOptions({ binFieldNum: 1 }));
    if (typeInfo.concreteInfo && typeInfo.concreteInfo.registered) {
        result += "}";
    }
    if (space) {
        result = JSON.stringify(JSON.parse(result), null, space);
    }
    return result;
}
exports.marshalJson = marshalJson;
function registerConcrete(name, value) {
    if (typeof value !== "object") {
        throw new Error("can register only object");
    }
    var disfix = codec_1.nameToDisfix(name);
    var typeInfo = codec_1.getTypeInfo(value);
    if (typeInfo) {
        var concreteInfo = typeInfo.concreteInfo;
        if (!concreteInfo) {
            concreteInfo = {
                registered: true,
                name: name,
                disamb: disfix.disambBytes,
                prefix: disfix.prefixBytes
            };
        }
        else {
            if (concreteInfo.registered) {
                throw new Error("concrete already registered");
            }
            concreteInfo.registered = true;
            concreteInfo.name = name;
            concreteInfo.disamb = disfix.disambBytes;
            concreteInfo.prefix = disfix.prefixBytes;
        }
        typeInfo.concreteInfo = concreteInfo;
    }
    else {
        throw new Error("unregistered type");
    }
}
exports.registerConcrete = registerConcrete;
function registerStruct(value, info) {
    if (typeof value !== "object") {
        throw new Error("can register only object");
    }
    if (!value[type_1.Symbols.fieldTypeInfoMap]) {
        value[type_1.Symbols.fieldTypeInfoMap] = {};
    }
    if (info.structInfo && info.structInfo.fields) {
        for (var _i = 0, _a = info.structInfo.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            var typeInfo = {
                type: field.type,
                arrayOf: field.arrayOf
            };
            value[type_1.Symbols.fieldTypeInfoMap][field.name] = typeInfo;
        }
    }
    var resultInfo = __assign({
        type: type_1.Type.Struct
    }, info);
    codec_1.setTypeInfo(value, resultInfo);
}
exports.registerStruct = registerStruct;
function registerType(value, info, propertyKey) {
    if (typeof value !== "object") {
        throw new Error("can register only object");
    }
    value[type_1.Symbols.typeToPropertyKey] = propertyKey;
    codec_1.setTypeInfo(value, info);
}
exports.registerType = registerType;
// tslint:disable-next-line:function-name
function DefineType() {
    // tslint:disable-next-line: ban-types
    return function (constructor) {
        var decoTypeInfos = constructor.prototype[type_1.Symbols.decoratorTypeInfos];
        if (!decoTypeInfos) {
            throw new Error("should set only one property to define type");
        }
        var property;
        var method;
        for (var _i = 0, decoTypeInfos_1 = decoTypeInfos; _i < decoTypeInfos_1.length; _i++) {
            var decoTypeInfo = decoTypeInfos_1[_i];
            if (decoTypeInfo.type === "property") {
                if (property) {
                    throw new Error("should set only one property to define type");
                }
                property = decoTypeInfo;
            }
            else if (decoTypeInfo.type === "method") {
                if (method) {
                    throw new Error("should set only one method interface");
                }
                method = decoTypeInfo;
            }
        }
        if (!property) {
            throw new Error("should set only one property to define type");
        }
        var typeInfo = {
            type: property.typeInfo.type,
            arrayOf: property.typeInfo.arrayOf
        };
        if (method) {
            typeInfo.concreteInfo = {
                registered: false,
                name: "",
                disamb: new Uint8Array(),
                prefix: new Uint8Array(),
                aminoMarshalerMethod: method.aminoMarshalerMethod,
                aminoMarshalPeprType: method.aminoMarshalPeprType
            };
        }
        registerType(constructor.prototype, typeInfo, property.name);
    };
}
exports.DefineType = DefineType;
// tslint:disable-next-line:function-name
function DefineStruct() {
    // tslint:disable-next-line: ban-types
    return function (constructor) {
        var structInfo;
        var concreteInfo;
        if (constructor.prototype[type_1.Symbols.decoratorTypeInfos]) {
            var decoTypeInfos = constructor.prototype[type_1.Symbols.decoratorTypeInfos];
            var fields = [];
            for (var _i = 0, decoTypeInfos_2 = decoTypeInfos; _i < decoTypeInfos_2.length; _i++) {
                var decoTypeInfo = decoTypeInfos_2[_i];
                if (decoTypeInfo.type === "property") {
                    var property = decoTypeInfo;
                    fields.push(options_1.newFieldInfo(property.name, property.typeInfo.type, property.index, property.typeInfo.arrayOf, property.fieldOptions));
                }
                else if (decoTypeInfo.type === "method") {
                    var method = decoTypeInfo;
                    if (concreteInfo) {
                        throw new Error("should set only one method interface");
                    }
                    concreteInfo = {
                        registered: false,
                        name: "",
                        disamb: new Uint8Array(),
                        prefix: new Uint8Array(),
                        aminoMarshalerMethod: method.aminoMarshalerMethod,
                        aminoMarshalPeprType: method.aminoMarshalPeprType
                    };
                }
            }
            if (fields.length > 0) {
                structInfo = {
                    fields: fields
                };
            }
        }
        registerStruct(constructor.prototype, {
            structInfo: structInfo,
            concreteInfo: concreteInfo
        });
    };
}
exports.DefineStruct = DefineStruct;
// tslint:disable-next-line:function-name
function Concrete(name) {
    // tslint:disable-next-line: ban-types
    return function (constructor) {
        registerConcrete(name, constructor.prototype);
    };
}
exports.Concrete = Concrete;
function sortDecoTypeInfos(decoTypeInfos) {
    decoTypeInfos.sort(function (a, b) {
        if (a.type === "method") {
            return 1;
        }
        if (b.type === "method") {
            return -1;
        }
        return a.index - b.index;
    });
}
// tslint:disable-next-line:function-name
function Property(type, index, arrayOf, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return function (target, propertyKey) {
        if (typeof propertyKey === "symbol") {
            throw new Error("can not set property key as symbol");
        }
        if (!target[type_1.Symbols.decoratorTypeInfos]) {
            target[type_1.Symbols.decoratorTypeInfos] = [];
        }
        var property = {
            type: "property",
            name: propertyKey,
            index: index,
            typeInfo: {
                type: type,
                arrayOf: arrayOf
            },
            fieldOptions: fieldOptions
        };
        var decoTypeInfos = target[type_1.Symbols.decoratorTypeInfos];
        if (index < 0) {
            var numOfProperty = 0;
            for (var _i = 0, decoTypeInfos_3 = decoTypeInfos; _i < decoTypeInfos_3.length; _i++) {
                var decoTypeInfo = decoTypeInfos_3[_i];
                if (decoTypeInfo.type === "property") {
                    numOfProperty += 1;
                }
            }
            property.index = numOfProperty;
        }
        decoTypeInfos.push(property);
        sortDecoTypeInfos(decoTypeInfos);
    };
}
exports.Property = Property;
// tslint:disable-next-line:function-name
function Bool(index, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return Property(type_1.Type.Bool, index, undefined, fieldOptions);
}
// tslint:disable-next-line:function-name
function Int(index, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return Property(type_1.Type.Int, index, undefined, fieldOptions);
}
// tslint:disable-next-line:function-name
function Int8(index, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return Property(type_1.Type.Int8, index, undefined, fieldOptions);
}
// tslint:disable-next-line:function-name
function Int16(index, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return Property(type_1.Type.Int16, index, undefined, fieldOptions);
}
// tslint:disable-next-line:function-name
function Int32(index, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return Property(type_1.Type.Int32, index, undefined, fieldOptions);
}
// tslint:disable-next-line:function-name
function Int64(index, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return Property(type_1.Type.Int64, index, undefined, fieldOptions);
}
// tslint:disable-next-line:function-name
function Uint(index, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return Property(type_1.Type.Uint, index, undefined, fieldOptions);
}
// tslint:disable-next-line:function-name
function Uint8(index, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return Property(type_1.Type.Uint8, index, undefined, fieldOptions);
}
// tslint:disable-next-line:function-name
function Uint16(index, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return Property(type_1.Type.Uint16, index, undefined, fieldOptions);
}
// tslint:disable-next-line:function-name
function Uint32(index, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return Property(type_1.Type.Uint32, index, undefined, fieldOptions);
}
// tslint:disable-next-line:function-name
function Uint64(index, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return Property(type_1.Type.Uint64, index, undefined, fieldOptions);
}
// tslint:disable-next-line:function-name
function Array(index, arrayOf, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return Property(type_1.Type.Array, index, arrayOf, fieldOptions);
}
// tslint:disable-next-line:function-name
function Slice(index, arrayOf, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return Property(type_1.Type.Slice, index, arrayOf, fieldOptions);
}
// tslint:disable-next-line:function-name
function String(index, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return Property(type_1.Type.String, index, undefined, fieldOptions);
}
// tslint:disable-next-line:function-name
function Defined(index, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return Property(type_1.Type.Defined, index, undefined, fieldOptions);
}
// tslint:disable-next-line:function-name
function Interface(index, fieldOptions) {
    if (index === void 0) { index = -1; }
    if (fieldOptions === void 0) { fieldOptions = {}; }
    return Property(type_1.Type.Interface, index, undefined, fieldOptions);
}
// tslint:disable-next-line:function-name
function AminoMarshaler(type) {
    return function (target, propertyKey, descriptor) {
        if (typeof propertyKey === "symbol") {
            throw new Error("can not set property key as symbol");
        }
        if (!target[type_1.Symbols.decoratorTypeInfos]) {
            target[type_1.Symbols.decoratorTypeInfos] = [];
        }
        var method = {
            type: "method",
            aminoMarshalerMethod: propertyKey,
            aminoMarshalPeprType: type
        };
        var decoTypeInfos = target[type_1.Symbols.decoratorTypeInfos];
        decoTypeInfos.push(method);
        sortDecoTypeInfos(decoTypeInfos);
    };
}
// tslint:disable-next-line:variable-name
exports.Method = {
    AminoMarshaler: AminoMarshaler
};
// tslint:disable-next-line:variable-name
exports.Field = {
    Bool: Bool,
    Int: Int,
    Int8: Int8,
    Int16: Int16,
    Int32: Int32,
    Int64: Int64,
    Uint: Uint,
    Uint8: Uint8,
    Uint16: Uint16,
    Uint32: Uint32,
    Uint64: Uint64,
    Array: Array,
    Slice: Slice,
    String: String,
    Defined: Defined,
    Interface: Interface
};
//# sourceMappingURL=amino.js.map