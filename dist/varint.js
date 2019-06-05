"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var big_integer_1 = __importDefault(require("big-integer"));
// tslint:disable-next-line: no-submodule-imports
var buffer_1 = require("buffer/");
var MAX_UINT8 = big_integer_1.default("255");
var MAX_INT8 = big_integer_1.default("127");
var MIN_INT8 = big_integer_1.default("128").negate();
var MAX_UINT16 = big_integer_1.default("65535");
var MAX_INT16 = big_integer_1.default("32767");
var MIN_INT16 = big_integer_1.default("32768").negate();
var MAX_UINT32 = big_integer_1.default("4294967295");
var MAX_INT32 = big_integer_1.default("2147483647");
var MIN_INT32 = big_integer_1.default("2147483648").negate();
var MAX_UINT64 = big_integer_1.default("18446744073709551615");
var MAX_INT64 = big_integer_1.default("9223372036854775807");
var MIN_INT64 = big_integer_1.default("9223372036854775808").negate();
var UINT64_BIT64 = big_integer_1.default(1).shiftLeft(big_integer_1.default(63));
var uvarint = {
    encode: function (integer) {
        if (integer.isNegative()) {
            throw new Error("uinteger shouldn't be negative");
        }
        if (integer.bitLength().greater(big_integer_1.default(64))) {
            throw new Error("integer is too big");
        }
        var buf = buffer_1.Buffer.alloc(10);
        var tempInt = integer;
        var i = 0;
        while (tempInt.geq(big_integer_1.default(0x80))) {
            buf[i] = tempInt
                .mod(0x80)
                .or(0x80)
                .toJSNumber();
            tempInt = tempInt.shiftRight(7);
            i += 1;
        }
        buf[i] = tempInt.toJSNumber();
        return buf.slice(0, i + 1);
    },
    decode: function (buf) {
        var int = big_integer_1.default(0);
        var s = 0;
        for (var index = 0; index < buf.length; index += 1) {
            var byte = buf[index];
            if (byte < 0x80) {
                if (index > 9 || (index === 9 && byte > 1)) {
                    throw new Error("uvarint overflowed");
                }
                return int.or(big_integer_1.default(byte).shiftLeft(s));
            }
            // tslint:disable-next-line: no-bitwise
            int = int.or(big_integer_1.default(byte & 0x7f).shiftLeft(s));
            s += 7;
        }
        throw new Error("buffer may be empty");
    }
};
exports.uvarint = uvarint;
var varint = {
    encode: function (integer) {
        if (integer.bitLength().greater(big_integer_1.default(64))) {
            throw new Error("integer is too big");
        }
        mustInt64(integer);
        var tempInt = integer;
        if (integer.isNegative()) {
            // make integer to uint64 except signed bit
            tempInt = int64ToUint64(tempInt);
            tempInt = tempInt.minus(UINT64_BIT64);
            tempInt = tempInt.shiftLeft(1);
            tempInt = MAX_UINT64.minus(tempInt);
        }
        else {
            tempInt = integer.shiftLeft(1);
        }
        return uvarint.encode(tempInt);
    },
    decode: function (buf) {
        var tempInt = uvarint.decode(buf);
        var int = tempInt.shiftRight(1);
        // if negative
        if (tempInt.and(1).notEquals(big_integer_1.default(0))) {
            int = int.plus(big_integer_1.default(1));
            int = int.negate();
        }
        return int;
    }
};
exports.varint = varint;
function int64ToUint64(int64) {
    if (int64.isNegative()) {
        var uint64 = int64.negate();
        uint64 = uint64.minus(big_integer_1.default(1));
        uint64 = MAX_UINT64.minus(uint64);
        return uint64;
    }
    return int64;
}
function numberToInt(num) {
    var tempInt = typeof num === "bigint" ? num : big_integer_1.default(num);
    return tempInt;
}
function mustInt8(int) {
    var tempInt = numberToInt(int);
    if (tempInt.greater(MAX_INT8) || tempInt.lesser(MIN_INT8)) {
        throw new Error("out of range");
    }
}
function mustUint8(int) {
    var tempInt = numberToInt(int);
    if (tempInt.greater(MAX_UINT8) || tempInt.lesser(big_integer_1.default(0))) {
        throw new Error("out of range");
    }
}
function mustInt16(int) {
    var tempInt = numberToInt(int);
    if (tempInt.greater(MAX_INT16) || tempInt.lesser(MIN_INT16)) {
        throw new Error("out of range");
    }
}
function mustUint16(int) {
    var tempInt = numberToInt(int);
    if (tempInt.greater(MAX_UINT16) || tempInt.lesser(big_integer_1.default(0))) {
        throw new Error("out of range");
    }
}
function mustInt32(int) {
    var tempInt = numberToInt(int);
    if (tempInt.greater(MAX_INT32) || tempInt.lesser(MIN_INT32)) {
        throw new Error("out of range");
    }
}
function mustUint32(int) {
    var tempInt = numberToInt(int);
    if (tempInt.greater(MAX_UINT32) || tempInt.lesser(big_integer_1.default(0))) {
        throw new Error("out of range");
    }
}
function mustInt64(int) {
    var tempInt = numberToInt(int);
    if (tempInt.greater(MAX_INT64) || tempInt.lesser(MIN_INT64)) {
        throw new Error("out of range");
    }
}
function mustUint64(int) {
    var tempInt = numberToInt(int);
    if (tempInt.greater(MAX_UINT64) || tempInt.lesser(big_integer_1.default(0))) {
        throw new Error("out of range");
    }
}
var constants = {
    MAX_UINT8: MAX_UINT8,
    MAX_INT8: MAX_INT8,
    MIN_INT8: MIN_INT8,
    MAX_UINT16: MAX_UINT16,
    MAX_INT16: MAX_INT16,
    MIN_INT16: MIN_INT16,
    MAX_UINT32: MAX_UINT32,
    MAX_INT32: MAX_INT32,
    MIN_INT32: MIN_INT32,
    MAX_UINT64: MAX_UINT64,
    MAX_INT64: MAX_INT64,
    MIN_INT64: MIN_INT64,
    int64ToUint64: int64ToUint64,
    numberToInt: numberToInt,
    mustInt8: mustInt8,
    mustUint8: mustUint8,
    mustInt16: mustInt16,
    mustUint16: mustUint16,
    mustInt32: mustInt32,
    mustUint32: mustUint32,
    mustInt64: mustInt64,
    mustUint64: mustUint64
};
exports.constants = constants;
//# sourceMappingURL=varint.js.map