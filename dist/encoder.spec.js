"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
// tslint:disable-next-line: no-implicit-dependencies
require("mocha");
var Encoder = __importStar(require("./encoder"));
describe("Test encoder", function () {
    it("encode fixed int32", function () {
        var tests = [
            {
                int: 30,
                buf: new Uint8Array([30, 0, 0, 0])
            },
            {
                int: 127012,
                buf: new Uint8Array([36, 240, 1, 0])
            },
            {
                int: -30,
                buf: new Uint8Array([226, 255, 255, 255])
            },
            {
                int: -127012,
                buf: new Uint8Array([220, 15, 254, 255])
            }
        ];
        tests.forEach(function (test) {
            assert.equal(new Uint8Array(Encoder.encodeInt32(test.int)).toString(), test.buf.toString());
        });
    });
    it("encode fixed int64", function () {
        var tests = [
            {
                int: 30,
                buf: new Uint8Array([30, 0, 0, 0, 0, 0, 0, 0])
            },
            {
                int: 12701270142,
                buf: new Uint8Array([126, 0, 14, 245, 2, 0, 0, 0])
            },
            {
                int: -30,
                buf: new Uint8Array([226, 255, 255, 255, 255, 255, 255, 255])
            },
            {
                int: -12701270142,
                buf: new Uint8Array([130, 255, 241, 10, 253, 255, 255, 255])
            }
        ];
        tests.forEach(function (test) {
            assert.equal(new Uint8Array(Encoder.encodeInt64(test.int)).toString(), test.buf.toString());
        });
    });
    it("encode fixed uint32", function () {
        var tests = [
            {
                int: 30,
                buf: new Uint8Array([30, 0, 0, 0])
            },
            {
                int: 127012,
                buf: new Uint8Array([36, 240, 1, 0])
            }
        ];
        tests.forEach(function (test) {
            assert.equal(new Uint8Array(Encoder.encodeUint32(test.int)).toString(), test.buf.toString());
        });
    });
    it("encode fixed uint64", function () {
        var tests = [
            {
                int: 30,
                buf: new Uint8Array([30, 0, 0, 0, 0, 0, 0, 0])
            },
            {
                int: 12701270142,
                buf: new Uint8Array([126, 0, 14, 245, 2, 0, 0, 0])
            }
        ];
        tests.forEach(function (test) {
            assert.equal(new Uint8Array(Encoder.encodeUint64(test.int)).toString(), test.buf.toString());
        });
    });
    it("encode simple string", function () {
        var tests = [
            {
                str: "test",
                buf: new Uint8Array([4, 116, 101, 115, 116])
            }
        ];
        tests.forEach(function (test) {
            assert.equal(new Uint8Array(Encoder.encodeString(test.str)).toString(), test.buf.toString());
        });
    });
    it("encode simple utf8 string", function () {
        var tests = [
            {
                str: "유티에프8",
                buf: new Uint8Array([
                    13,
                    236,
                    156,
                    160,
                    237,
                    139,
                    176,
                    236,
                    151,
                    144,
                    237,
                    148,
                    132,
                    56
                ])
            }
        ];
        tests.forEach(function (test) {
            assert.equal(new Uint8Array(Encoder.encodeString(test.str)).toString(), test.buf.toString());
        });
    });
});
//# sourceMappingURL=encoder.spec.js.map