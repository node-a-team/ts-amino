import bigInteger from "big-integer";
// tslint:disable-next-line: no-implicit-dependencies
import "mocha";
import {
  Concrete,
  DefineStruct,
  DefineType,
  Field,
  marshalBinaryBare
} from "./amino";

@Concrete("test")
@DefineStruct()
class Test {
  @Field.Int64()
  public int64: bigInteger.BigInteger = bigInteger(4230802);

  @Field.Uint16()
  public uint16: number = 10;
}

// tslint:disable-next-line: max-classes-per-file
@Concrete("concrete-with-struct")
@DefineStruct()
class Test2 {
  @Field.Defined()
  public test: Test = new Test();
}

// tslint:disable-next-line: max-classes-per-file
@Concrete("concrete-with-interface")
@DefineStruct()
class Test3 {
  @Field.Interface()
  public test: Test = new Test();
}

// tslint:disable-next-line: max-classes-per-file
@Concrete("concrete-with-deep-definition")
@DefineStruct()
class Test4 {
  @Field.Defined()
  public test: Definition = new Definition();
}

// tslint:disable-next-line: max-classes-per-file
@DefineType()
class Definition {
  @Field.Defined()
  public test: Test = new Test();
}

describe("Test amino", () => {
  it("test decorator", () => {
    const test = new Test();

    const bz = marshalBinaryBare(test);

    // tslint:disable-next-line: no-console
    console.log(Buffer.from(bz).toString("hex"));
  });

  it("test concrete with struct", () => {
    const test = new Test2();

    const bz = marshalBinaryBare(test);

    // tslint:disable-next-line: no-console
    console.log(Buffer.from(bz).toString("hex"));
  });

  it("test concrete with interface", () => {
    const test = new Test3();

    const bz = marshalBinaryBare(test);

    // tslint:disable-next-line: no-console
    console.log(Buffer.from(bz).toString("hex"));
  });

  it("test concrete with deep definition", () => {
    const test = new Test4();

    const bz = marshalBinaryBare(test);

    // tslint:disable-next-line: no-console
    console.log(Buffer.from(bz).toString("hex"));
  });
});
