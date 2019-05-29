import assert = require("assert");
import bigInteger from "big-integer";
// tslint:disable-next-line: no-implicit-dependencies
import "mocha";
import { uvarint, varint } from "./varint";

describe("Test varint", () => {
  it("uvarint should be encoded properly", () => {
    for (let i = 0; i < 64; i += 1) {
      const int = bigInteger(1).shiftLeft(i);
      const buf = uvarint.encode(int);
      assert.equal(uvarint.decode(buf).toString(), int.toString());
    }

    for (let i = 0; i < 8; i += 1) {
      const int = bigInteger(0b10011001).shiftLeft(i * 8);
      const buf = uvarint.encode(int);
      assert.equal(uvarint.decode(buf).toString(), int.toString());
    }

    const tests = [
      {
        int: bigInteger(482395),
        buf: new Uint8Array([219, 184, 29])
      },
      {
        int: bigInteger(13523952305),
        buf: new Uint8Array([177, 197, 220, 176, 50])
      }
    ];

    tests.forEach(test => {
      assert.equal(
        new Uint8Array(uvarint.encode(test.int)).toString(),
        test.buf.toString()
      );
      assert.equal(uvarint.decode(test.buf).toString(), test.int.toString());
    });
  });

  it("varint should be encoded properly", () => {
    for (let i = 0; i < 63; i += 1) {
      const int = bigInteger(1).shiftLeft(i);
      const buf = varint.encode(int);
      assert.equal(varint.decode(buf).toString(), int.toString());
    }

    for (let i = 0; i < 63; i += 1) {
      const int = bigInteger(1)
        .shiftLeft(i)
        .negate();
      const buf = varint.encode(int);
      assert.equal(varint.decode(buf).toString(), int.toString());
    }

    const tests = [
      {
        int: bigInteger(482395).negate(),
        buf: new Uint8Array([181, 241, 58])
      },
      {
        int: bigInteger(13523952305).negate(),
        buf: new Uint8Array([225, 138, 185, 225, 100])
      }
    ];

    tests.forEach(test => {
      assert.equal(
        new Uint8Array(varint.encode(test.int)).toString(),
        test.buf.toString()
      );
      assert.equal(varint.decode(test.buf).toString(), test.int.toString());
    });
  });
});
