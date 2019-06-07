"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var big_integer_1 = __importDefault(require("big-integer"));
// tslint:disable-next-line: no-submodule-imports
var buffer_1 = require("buffer/");
var sha_js_1 = require("sha.js");
var type_1 = require("./type");
exports.prefixBytesLen = 4;
exports.disambBytesLen = 3;
exports.disfixBytesLen = exports.prefixBytesLen + exports.disambBytesLen;
function nameToDisfix(name) {
    var buffer = buffer_1.Buffer.from(new sha_js_1.sha256().update(name).digest("hex"), "hex");
    var i = 0;
    while (buffer[i] === 0) {
        i += 1;
    }
    var disambBytes = new Uint8Array(buffer.slice(i, i + exports.disambBytesLen));
    i += exports.disambBytesLen;
    while (buffer[i] === 0) {
        i += 1;
    }
    var prefixBytes = new Uint8Array(buffer.slice(i, i + exports.prefixBytesLen));
    return {
        disambBytes: disambBytes,
        prefixBytes: prefixBytes
    };
}
exports.nameToDisfix = nameToDisfix;
function setTypeInfo(value, typeInfo) {
    Object.defineProperty(value.constructor, type_1.Symbols.typeInfo, {
        value: typeInfo,
        writable: false
    });
}
exports.setTypeInfo = setTypeInfo;
function getTypeInfo(value) {
    var descriptor = Object.getOwnPropertyDescriptor(value.constructor, type_1.Symbols.typeInfo);
    return descriptor ? descriptor.value : undefined;
}
exports.getTypeInfo = getTypeInfo;
function deferTypeInfo(info, value, fieldKey, forJSON) {
    if (forJSON === void 0) { forJSON = false; }
    var deferedValue = value;
    var deferedInfo = info;
    if (fieldKey) {
        deferedValue = value[fieldKey];
        if (deferedValue == null) {
            throw new Error("invalid field key");
        }
        deferedInfo = value[type_1.Symbols.fieldTypeInfoMap][fieldKey];
        if (!deferedInfo) {
            throw new Error("undefined type info");
        }
        if (deferedInfo.type === type_1.Type.Defined) {
            deferedInfo = getTypeInfo(deferedValue);
            if (!deferedInfo) {
                throw new Error("unregisterd type");
            }
        }
    }
    var i = 0;
    while (deferedInfo.type === type_1.Type.Defined) {
        if (typeof deferedValue === "object") {
            deferedInfo = getTypeInfo(deferedValue);
            if (!deferedInfo) {
                throw new Error("unregisterd type");
            }
            if (deferedInfo.type !== type_1.Type.Defined) {
                break;
            }
            var propertyKey = deferedValue[type_1.Symbols.typeToPropertyKey];
            if (!propertyKey) {
                throw new Error("property key unknown");
            }
            deferedValue = deferedValue[propertyKey];
            if (deferedValue == null) {
                throw new Error("invalid property");
            }
        }
        i += 1;
        if (i >= 10) {
            throw new Error("too deep definition or may invalid type");
        }
    }
    if ((!forJSON || (forJSON && !deferedValue.marshalJSON)) &&
        (!deferedInfo.concreteInfo ||
            (!deferedInfo.concreteInfo.aminoMarshalerMethod &&
                !deferedInfo.concreteInfo.aminoMarshalPeprType))) {
        if (deferedInfo.type !== type_1.Type.Struct &&
            deferedInfo.type !== type_1.Type.Interface) {
            if (!(deferedValue instanceof big_integer_1.default) &&
                typeof deferedValue === "object" &&
                !(deferedValue instanceof Uint8Array) &&
                !Array.isArray(deferedValue) &&
                !buffer_1.Buffer.isBuffer(deferedValue)) {
                var propertyKey = deferedValue[type_1.Symbols.typeToPropertyKey];
                if (!propertyKey) {
                    throw new Error("property key unknown");
                }
                deferedValue = deferedValue[propertyKey];
            }
        }
    }
    return [deferedInfo, deferedValue];
}
exports.deferTypeInfo = deferTypeInfo;
//# sourceMappingURL=codec.js.map