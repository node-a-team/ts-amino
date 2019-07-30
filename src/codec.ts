// tslint:disable-next-line: no-submodule-imports
import { Buffer } from "buffer/";
import * as BinaryEncoder from "./binary-encode";
import * as Encoder from "./encoder";
import * as JsonEncoder from "./json-encode";
import { ConcreteInfo, defaultFieldOptions, TypeInfo } from "./options";
import { CodecSymbols } from "./type";
import { getTypeInfo, nameToDisfix, setConcreteInfoForCodec } from "./util";

export class Codec {
  private readonly symbolConcreteInfo = Symbol("concreateInfo");

  public get symbols(): CodecSymbols {
    return {
      concreteInfo: this.symbolConcreteInfo
    };
  }

  public marshalBinaryBare<T = any>(value: T): Uint8Array {
    if (!value) {
      throw new Error("value is null");
    }

    if (typeof value !== "object") {
      throw new Error("only support object");
    }

    const typeInfo: TypeInfo | undefined = getTypeInfo(this, value);
    if (!typeInfo) {
      throw new Error("type info should be set");
    }

    let bz = BinaryEncoder.encodeReflectBinary(
      this,
      typeInfo,
      value,
      defaultFieldOptions({ binFieldNum: 1 }),
      true
    );
    if (typeInfo.concreteInfo && typeInfo.concreteInfo.registered) {
      bz = Buffer.concat([
        Buffer.from(typeInfo.concreteInfo.prefix),
        Buffer.from(bz)
      ]);
    }

    return bz;
  }

  public marshalBinaryLengthPrefixed<T = any>(value: T): Uint8Array {
    let bz = this.marshalBinaryBare(value);
    bz = Buffer.concat([
      Buffer.from(Encoder.encodeUvarint(bz.length)),
      Buffer.from(bz)
    ]);

    return bz;
  }

  public marshalJson<T = any>(value: T, space?: string | number): string {
    if (!value) {
      throw new Error("value is null");
    }

    if (typeof value !== "object") {
      throw new Error("only support object");
    }

    const typeInfo: TypeInfo | undefined = getTypeInfo(this, value);
    if (!typeInfo) {
      throw new Error("type info should be set");
    }

    let result = "";
    if (typeInfo.concreteInfo && typeInfo.concreteInfo.registered) {
      result = `{"type":"${typeInfo.concreteInfo.name}","value":`;
    }

    result += JsonEncoder.encodeReflectJSON(
      this,
      typeInfo,
      value,
      defaultFieldOptions({ binFieldNum: 1 })
    );

    if (typeInfo.concreteInfo && typeInfo.concreteInfo.registered) {
      result += "}";
    }

    if (space) {
      result = JSON.stringify(JSON.parse(result), null, space);
    }

    return result;
  }

  public registerConcrete(name: string, value: any) {
    if (typeof value !== "object") {
      throw new Error("can register only object");
    }

    const disfix = nameToDisfix(name);

    const typeInfo = getTypeInfo(this, value);
    if (typeInfo) {
      let concreteInfo: ConcreteInfo | undefined = typeInfo.concreteInfo;
      if (!concreteInfo) {
        concreteInfo = {
          registered: true,
          name,
          disamb: disfix.disambBytes,
          prefix: disfix.prefixBytes
        };
      } else {
        // shallow copy
        concreteInfo = { ...concreteInfo };

        if (concreteInfo.registered) {
          throw new Error("concrete already registered");
        }

        concreteInfo.registered = true;
        concreteInfo.name = name;
        concreteInfo.disamb = disfix.disambBytes;
        concreteInfo.prefix = disfix.prefixBytes;
      }

      setConcreteInfoForCodec(this, value, concreteInfo);
    } else {
      throw new Error("unregistered type");
    }
  }
}
