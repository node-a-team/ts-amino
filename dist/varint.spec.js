"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var big_integer_1 = __importDefault(require("big-integer"));
// tslint:disable-next-line: no-implicit-dependencies
require("mocha");
var varint_1 = require("./varint");
describe("Test varint", function () {
    it("uvarint should be encoded properly", function () {
        for (var i = 0; i < 64; i += 1) {
            var int = big_integer_1.default(1).shiftLeft(i);
            var buf = varint_1.uvarint.encode(int);
            assert.equal(varint_1.uvarint.decode(buf).toString(), int.toString());
        }
        for (var i = 0; i < 8; i += 1) {
            var int = big_integer_1.default(153).shiftLeft(i * 8);
            var buf = varint_1.uvarint.encode(int);
            assert.equal(varint_1.uvarint.decode(buf).toString(), int.toString());
        }
        var tests = [
            {
                int: big_integer_1.default(482395),
                buf: new Uint8Array([219, 184, 29])
            },
            {
                int: big_integer_1.default(13523952305),
                buf: new Uint8Array([177, 197, 220, 176, 50])
            }
        ];
        tests.forEach(function (test) {
            assert.equal(new Uint8Array(varint_1.uvarint.encode(test.int)).toString(), test.buf.toString());
            assert.equal(varint_1.uvarint.decode(test.buf).toString(), test.int.toString());
        });
    });
    it("varint should be encoded properly", function () {
        for (var i = 0; i < 63; i += 1) {
            var int = big_integer_1.default(1).shiftLeft(i);
            var buf = varint_1.varint.encode(int);
            assert.equal(varint_1.varint.decode(buf).toString(), int.toString());
        }
        for (var i = 0; i < 63; i += 1) {
            var int = big_integer_1.default(1)
                .shiftLeft(i)
                .negate();
            var buf = varint_1.varint.encode(int);
            assert.equal(varint_1.varint.decode(buf).toString(), int.toString());
        }
        var tests = [
            {
                int: big_integer_1.default(482395).negate(),
                buf: new Uint8Array([181, 241, 58])
            },
            {
                int: big_integer_1.default(13523952305).negate(),
                buf: new Uint8Array([225, 138, 185, 225, 100])
            }
        ];
        tests.forEach(function (test) {
            assert.equal(new Uint8Array(varint_1.varint.encode(test.int)).toString(), test.buf.toString());
            assert.equal(varint_1.varint.decode(test.buf).toString(), test.int.toString());
        });
    });
});
//# sourceMappingURL=varint.spec.js.map