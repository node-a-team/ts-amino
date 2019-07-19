// tslint:disable-next-line: no-submodule-imports
import { Buffer } from "buffer/";
import { deferTypeInfo, getTypeInfo } from "./codec";
import { FieldOptions, TypeInfo } from "./options";
import { Type } from "./type";

export function encodeReflectJSON(
  info: TypeInfo,
  value: any,
  fopts: FieldOptions
): string {
  const [deferedInfo, deferedValue] = deferTypeInfo(info, value, "", true);
  // tslint:disable-next-line:no-parameter-reassignment
  info = deferedInfo;
  // tslint:disable-next-line:no-parameter-reassignment
  value = deferedValue;

  // Write null if necessary
  if (value === null || value === undefined) {
    return "null";
  }

  // TODO: handle time type

  // Handle override if value has marshalJSON method
  if (value.marshalJSON != null) {
    return value.marshalJSON();
  }

  if (info.concreteInfo) {
    const concreteInfo = info.concreteInfo;
    if (
      concreteInfo.aminoMarshalerMethod &&
      concreteInfo.aminoMarshalPeprType
    ) {
      // tslint:disable-next-line:no-parameter-reassignment
      value = value[info.concreteInfo.aminoMarshalerMethod!]();

      // tslint:disable-next-line:no-parameter-reassignment
      info = {
        type: concreteInfo.aminoMarshalPeprType.type,
        arrayOf: concreteInfo.aminoMarshalPeprType.arrayOf
      };

      return encodeReflectJSON(info, value, fopts);
    }
  }

  switch (info.type) {
    case Type.Interface:
      return encodeReflectJSONInterface(info, value, fopts);
    case Type.Array:
    case Type.Slice:
      return encodeReflectJSONList(info, value, fopts);
    case Type.Struct:
      return encodeReflectJSONStruct(info, value, fopts);
    // TODO: handle map https://github.com/tendermint/go-amino/blob/master/json-encode.go#L93
    case Type.Int64:
    case Type.Int:
      return `"${value}"`;
    case Type.Uint64:
    case Type.Uint:
      return `"${value}"`;
    case Type.Int32:
    case Type.Int16:
    case Type.Int8:
    case Type.Uint32:
    case Type.Uint16:
    case Type.Uint8:
      return JSON.stringify(value);
    case Type.Bool:
    case Type.String:
      return JSON.stringify(value);
    case Type.Float64:
      throw new Error("not yet implemented");
    case Type.Float32:
      throw new Error("not yet implemented");
    case Type.Defined:
      throw new Error("can't get a type from child object");
    default:
      throw new Error("unsupported type");
  }
}

function encodeReflectJSONInterface(
  iinfo: TypeInfo,
  value: any,
  fopts: FieldOptions
): string {
  if (!value) {
    return "null";
  }

  const cinfo: TypeInfo | undefined = getTypeInfo(value);
  if (!cinfo || !cinfo.concreteInfo || !cinfo.concreteInfo.registered) {
    throw new Error("Cannot encode unregistered concrete type");
  }

  let result = `{"type":"${cinfo.concreteInfo.name}","value":`;
  result += encodeReflectJSON(cinfo, value, fopts);
  result += "}";
  return result;
}

function encodeReflectJSONList(
  info: TypeInfo,
  value: any[],
  fopts: FieldOptions
): string {
  // if null
  if (!value || value.length === 0) {
    return "null";
  }

  // if type is byte array
  if (
    value instanceof Uint8Array ||
    (info.arrayOf && info.arrayOf.type === Type.Uint8)
  ) {
    return `"${Buffer.from(value).toString("base64")}"`;
  }

  if (!info.arrayOf) {
    throw new Error("should set a type of array element");
  }
  const etype = info.arrayOf!;
  const einfo: TypeInfo = {
    type: etype.type,
    arrayOf: etype.arrayOf
  };

  let result = "[";
  for (let i = 0; i < value.length; i++) {
    const v = value[i];
    result += encodeReflectJSON(einfo, v, fopts);
    // Add a comma if it isn't the last item.
    if (i !== value.length - 1) {
      result += ",";
    }
  }
  result += "]";
  return result;
}

function encodeReflectJSONStruct(
  info: TypeInfo,
  value: any,
  fopts: FieldOptions
): string {
  let result = "{";

  if (!info.structInfo) {
    throw new Error("should set types of struct elements");
  }

  let writeComma = false;
  // tslint:disable-next-line: forin
  for (const key in info.structInfo.fields) {
    const field = info.structInfo.fields[key];
    let [finfo, frv] = deferTypeInfo(info, value, field.name, true);

    if (finfo.concreteInfo) {
      const concreteInfo = finfo.concreteInfo;
      if (
        concreteInfo.aminoMarshalerMethod &&
        concreteInfo.aminoMarshalPeprType
      ) {
        frv = frv[finfo.concreteInfo.aminoMarshalerMethod!]();

        finfo = {
          type: concreteInfo.aminoMarshalPeprType.type,
          arrayOf: concreteInfo.aminoMarshalPeprType.arrayOf
        };
      }
    }

    // TODO: handling omit empty https://github.com/tendermint/go-amino/blob/master/json-encode.go#L301

    if (writeComma) {
      result += ",";
      writeComma = false;
    }

    let name = key;
    if (field.fieldOptions.jsonName) {
      name = field.fieldOptions.jsonName;
    }
    result += JSON.stringify(name);
    result += ":";

    result += encodeReflectJSON(finfo, frv, fopts);
    writeComma = true;
  }
  result += "}";

  return result;
}
