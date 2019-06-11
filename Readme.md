### Description
This software implements typescript(javascript) bindings for the Amino encoding protocol.

Amino is an object encoding specification. It is a subset of Proto3 with
an extension for interface support.  See the [Proto3 spec](https://developers.google.com/protocol-buffers/docs/proto3)
for more information on Proto3, which Amino is largely compatible with (but not with Proto2).

The goal of the Amino encoding protocol is to bring parity into logic objects
and persistence objects.

*But  now this is very early stage, so the immediate goal is to be fully compatible with [go-amino](https://github.com/tendermint/go-amino) to use for [Cosmos-sdk](https://github.com/cosmos/cosmos-sdk).*

### Featurs
- [x] Support basic encoding binary/json
- [ ] Support basic decoding binary/json
- [x] Support (u)int64 with [BigInteger.js](https://github.com/peterolson/BigInteger.js) as [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) polyfill
- [ ] Encode/decode Time type
- [x] Support decorator for ES7 (You need to use babel or typescript) 

### Decorator
More  details and documents will be available  soon
```typescript
import  {  Amino,  Type  }  from  "ts-amino";
const { Field,  Concrete,  DefineStruct } =  Amino;
import  bigInteger  from  "big-integer";

@Concrete("cosmos-sdk/MsgSend")
@DefineStruct()
class  MsgSend {
  @Field.Defined(0, {
    jsonName:  "from_address"
  })
  public fromAddress:  AccAddress;

  @Field.Defined(1, {
    jsonName:  "to_address"
  })
  public toAddress:  AccAddress;

  @Field.Slice(
    2,
    { type:  Type.Defined },
    {
      jsonName:  "amount"
    }
  )
  public amount:  Coin[];

  constructor(fromAddress:  AccAddress, toAddress:  AccAddress, amount:  Coin[]) {
    super();
    this.fromAddress  = fromAddress;
    this.toAddress  = toAddress;
    this.amount  = amount;
  }

  public  getSigners():  AccAddress[] {
    return [this.fromAddress];
  }
}

@DefineType()
class  AccAddress {
  @Field.Array(0, { type:  Type.Uint8 })
  private address:  Uint8Array;

  constructor(address:  Uint8Array) {
    this.address  = address
  }

  public  marshalJSON():  Uint8Array {
    return  Buffer.from(`"${this.toBech32()}"`, "utf8");
  }
}

@DefineStruct()
class  Coin {
  @Field.String(0)
  public denom:  string;

  @Field.Defined(1)
  public amount:  Int;

  constructor(denom:  string, amount:  Int) {
    this.denom  = denom;
    this.amount  = amount;
  }
}

@DefineStruct()
class  Int {
  private int:  bigInteger.BigInteger;
  
  constructor(
    int:  bigInteger.BigInteger,
  ) {
    this.int  =  int;
  }

  @Method.AminoMarshaler({ type:  Type.String })
  public  marshalAmino():  string {
    return  this.int.toString(10);
  }
}
```
