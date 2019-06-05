"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var big_integer_1 = __importDefault(require("big-integer"));
// tslint:disable-next-line: no-submodule-imports
var buffer_1 = require("buffer/");
var varint_1 = require("./varint");
function encodeInt8(i) {
    varint_1.constants.mustInt8(i);
    return encodeVarint(i);
}
exports.encodeInt8 = encodeInt8;
function encodeInt16(i) {
    varint_1.constants.mustInt16(i);
    return encodeVarint(i);
}
exports.encodeInt16 = encodeInt16;
function encodeInt32(i) {
    varint_1.constants.mustInt32(i);
    var buf = buffer_1.Buffer.alloc(4);
    buf.writeIntLE(i, 0, 4);
    return buf;
}
exports.encodeInt32 = encodeInt32;
function encodeInt64(i) {
    varint_1.constants.mustInt64(i);
    var int = varint_1.constants.numberToInt(i);
    if (int.isNegative()) {
        int = int.negate();
        int = int.minus(big_integer_1.default(1));
        int = varint_1.constants.MAX_UINT64.minus(int);
    }
    var buf = buffer_1.Buffer.from(int.toArray(256).value.reverse());
    if (buf.length > 8) {
        throw new Error("buffer overflowed");
    }
    buf = buffer_1.Buffer.concat([buf, buffer_1.Buffer.alloc(8 - buf.length)], 8);
    return buf;
}
exports.encodeInt64 = encodeInt64;
function encodeVarint(i) {
    varint_1.constants.mustInt64(i);
    var int = varint_1.constants.numberToInt(i);
    return varint_1.varint.encode(big_integer_1.default(int));
}
exports.encodeVarint = encodeVarint;
function varintSize(i) {
    return encodeVarint(i).length;
}
exports.varintSize = varintSize;
function encodeByte(b) {
    varint_1.constants.mustUint8(b);
    return varint_1.uvarint.encode(big_integer_1.default(b));
}
exports.encodeByte = encodeByte;
function encodeUint8(u) {
    return encodeByte(u);
}
exports.encodeUint8 = encodeUint8;
function encodeUint16(u) {
    varint_1.constants.mustUint16(u);
    return varint_1.uvarint.encode(big_integer_1.default(u));
}
exports.encodeUint16 = encodeUint16;
function encodeUint32(u) {
    varint_1.constants.mustUint32(u);
    var buf = buffer_1.Buffer.alloc(4);
    buf.writeUIntLE(u, 0, 4);
    return buf;
}
exports.encodeUint32 = encodeUint32;
function encodeUint64(u) {
    varint_1.constants.mustUint64(u);
    var uint = varint_1.constants.numberToInt(u);
    var buf = buffer_1.Buffer.from(uint.toArray(256).value.reverse());
    if (buf.length > 8) {
        throw new Error("buffer overflowed");
    }
    buf = buffer_1.Buffer.concat([buf, buffer_1.Buffer.alloc(8 - buf.length)], 8);
    return buf;
}
exports.encodeUint64 = encodeUint64;
function encodeUvarint(u) {
    varint_1.constants.mustUint64(u);
    var uint = varint_1.constants.numberToInt(u);
    return varint_1.uvarint.encode(uint);
}
exports.encodeUvarint = encodeUvarint;
function uvarintSize(u) {
    return encodeUvarint(u).length;
}
exports.uvarintSize = uvarintSize;
function encodeBool(b) {
    if (b) {
        return encodeUint8(1);
    }
    return encodeUint8(0);
}
exports.encodeBool = encodeBool;
// TODO: encodeFloat32
// TODO: encodeFloat64
// TODO: encodeTime
function encodeByteSlice(bz) {
    var buf = varint_1.uvarint.encode(big_integer_1.default(bz.length));
    return buffer_1.Buffer.concat([buffer_1.Buffer.from(buf), buffer_1.Buffer.from(bz)]);
}
exports.encodeByteSlice = encodeByteSlice;
function byteSliceSize(bz) {
    return encodeByteSlice(bz).length;
}
exports.byteSliceSize = byteSliceSize;
function encodeString(s) {
    return encodeByteSlice(buffer_1.Buffer.from(s));
}
exports.encodeString = encodeString;
//# sourceMappingURL=encoder.js.map