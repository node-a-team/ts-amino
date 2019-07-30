import assert = require("assert");
import bigInteger from "big-integer";
// tslint:disable-next-line: no-implicit-dependencies
import "mocha";
import {
  Concrete,
  DefineStruct,
  DefineType,
  Field,
  marshalBinaryBare,
  marshalJson,
  Method
} from "./amino";
import { Codec } from "./codec";
import { Type } from "./type";

// tslint:disable: no-console
// tslint:disable: max-classes-per-file

@Concrete("test")
@DefineStruct()
class Test {
  @Field.Int64(0, {
    jsonName: "test"
  })
  public int64: bigInteger.BigInteger = bigInteger(4230802);

  @Field.Uint16()
  public uint16: number = 10;
}

@Concrete("concrete-with-struct")
@DefineStruct()
class Test2 {
  @Field.Defined()
  public test: Test = new Test();
}

@Concrete("concrete-with-interface")
@DefineStruct()
class Test3 {
  @Field.Interface()
  public test: Test = new Test();
}

@Concrete("concrete-with-deep-definition")
@DefineStruct()
class Test4 {
  @Field.Defined()
  public test: Definition = new Definition();
}

@DefineType()
class Definition {
  @Field.String()
  public test: string = "should not visibile";

  @Method.AminoMarshaler({ type: Type.String })
  public marshalAmino(): string {
    return "test";
  }
}

describe("Test amino", () => {
  it("test decorator", () => {
    const test = new Test();

    const bz = marshalBinaryBare(test);

    assert.equal(Buffer.from(bz).toString("hex"), "81884c7d08929d8202100a");
    assert.equal(
      marshalJson(test),
      `{"type":"test","value":{"test":"4230802","uint16":10}}`
    );
  });

  it("test concrete with struct", () => {
    const test = new Test2();

    const bz = marshalBinaryBare(test);

    assert.equal(Buffer.from(bz).toString("hex"), "43e99ea80a0708929d8202100a");
    assert.equal(
      marshalJson(test),
      `{"type":"concrete-with-struct","value":{"test":{"test":"4230802","uint16":10}}}`
    );
  });

  it("test concrete with interface", () => {
    const test = new Test3();

    const bz = marshalBinaryBare(test);

    assert.equal(
      Buffer.from(bz).toString("hex"),
      "f0de397d0a0b81884c7d08929d8202100a"
    );
    assert.equal(
      marshalJson(test),
      `{"type":"concrete-with-interface","value":{"test":{"type":"test","value":{"test":"4230802","uint16":10}}}}`
    );
  });

  it("test concrete with deep definition", () => {
    const test = new Test4();

    const bz = marshalBinaryBare(test);

    assert.equal(Buffer.from(bz).toString("hex"), "e456c43f0a0474657374");
    assert.equal(
      marshalJson(test),
      `{"type":"concrete-with-deep-definition","value":{"test":"test"}}`
    );
  });

  it("test codec", () => {
    const codec = new Codec();

    codec.registerConcrete("test", Test.prototype);
    codec.registerConcrete("concrete-with-struct", Test2.prototype);
    codec.registerConcrete("concrete-with-interface", Test3.prototype);
    codec.registerConcrete("concrete-with-deep-definition", Test4.prototype);

    const test = new Test4();

    const bz = codec.marshalBinaryBare(test);

    assert.equal(Buffer.from(bz).toString("hex"), "e456c43f0a0474657374");
    assert.equal(
      marshalJson(test),
      `{"type":"concrete-with-deep-definition","value":{"test":"test"}}`
    );
  });
});
