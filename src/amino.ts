// tslint:disable-next-line: no-submodule-imports
import { Buffer } from "buffer/";
import * as BinaryEncoder from "./binary-encode";
import * as Encoder from "./encoder";
import * as JsonEncoder from "./json-encode";
import {
  ConcreteInfo,
  defaultFieldOptions,
  FieldInfo,
  FieldOptions,
  newFieldInfo,
  StructInfo,
  TypeInfo
} from "./options";
import { Symbols, Type } from "./type";
import { getTypeInfo, nameToDisfix, setTypeInfo } from "./util";

export function marshalBinaryBare<T = any>(value: T): Uint8Array {
  if (!value) {
    throw new Error("value is null");
  }

  if (typeof value !== "object") {
    throw new Error("only support object");
  }

  const typeInfo: TypeInfo | undefined = getTypeInfo(value);
  if (!typeInfo) {
    throw new Error("type info should be set");
  }

  let bz = BinaryEncoder.encodeReflectBinary(
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

export function marshalBinaryLengthPrefixed<T = any>(value: T): Uint8Array {
  let bz = marshalBinaryBare(value);
  bz = Buffer.concat([
    Buffer.from(Encoder.encodeUvarint(bz.length)),
    Buffer.from(bz)
  ]);

  return bz;
}

export function marshalJson<T = any>(
  value: T,
  space?: string | number
): string {
  if (!value) {
    throw new Error("value is null");
  }

  if (typeof value !== "object") {
    throw new Error("only support object");
  }

  const typeInfo: TypeInfo | undefined = getTypeInfo(value);
  if (!typeInfo) {
    throw new Error("type info should be set");
  }

  let result = "";
  if (typeInfo.concreteInfo && typeInfo.concreteInfo.registered) {
    result = `{"type":"${typeInfo.concreteInfo.name}","value":`;
  }

  result += JsonEncoder.encodeReflectJSON(
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

export function registerConcrete(name: string, value: any) {
  if (typeof value !== "object") {
    throw new Error("can register only object");
  }

  const disfix = nameToDisfix(name);

  const typeInfo = getTypeInfo(value);
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
      if (concreteInfo.registered) {
        throw new Error("concrete already registered");
      }

      concreteInfo.registered = true;
      concreteInfo.name = name;
      concreteInfo.disamb = disfix.disambBytes;
      concreteInfo.prefix = disfix.prefixBytes;
    }

    typeInfo.concreteInfo = concreteInfo;
  } else {
    throw new Error("unregistered type");
  }
}

export function registerStruct(
  value: any,
  info: Pick<TypeInfo, Exclude<keyof TypeInfo, "type" | "arrayOf">>
) {
  if (typeof value !== "object") {
    throw new Error("can register only object");
  }

  if (!value[Symbols.fieldTypeInfoMap]) {
    value[Symbols.fieldTypeInfoMap] = {};
  }

  if (info.structInfo && info.structInfo.fields) {
    for (const field of info.structInfo.fields) {
      const typeInfo: TypeInfo = {
        type: field.type,
        arrayOf: field.arrayOf
      };
      value[Symbols.fieldTypeInfoMap][field.name] = typeInfo;
    }
  }

  const resultInfo: TypeInfo = {
    ...{
      type: Type.Struct
    },
    ...info
  };
  setTypeInfo(value, resultInfo);
}

export function registerType(
  value: any,
  info: Pick<TypeInfo, "type" | "arrayOf" | "concreteInfo">,
  propertyKey: string
) {
  if (typeof value !== "object") {
    throw new Error("can register only object");
  }

  value[Symbols.typeToPropertyKey] = propertyKey;
  setTypeInfo(value, info);
}

// tslint:disable-next-line:function-name
export function DefineType(): ClassDecorator {
  // tslint:disable-next-line: ban-types
  return (constructor: Function) => {
    const decoTypeInfos: DecoratorTypeInfo[] | undefined =
      constructor.prototype[Symbols.decoratorTypeInfos];
    if (!decoTypeInfos) {
      throw new Error("should set only one property to define type");
    }
    let property: Property | undefined;
    let method: Method | undefined;
    for (const decoTypeInfo of decoTypeInfos) {
      if (decoTypeInfo.type === "property") {
        if (property) {
          throw new Error("should set only one property to define type");
        }
        property = decoTypeInfo;
      } else if (decoTypeInfo.type === "method") {
        if (method) {
          throw new Error("should set only one method interface");
        }
        method = decoTypeInfo;
      }
    }
    if (!property) {
      throw new Error("should set only one property to define type");
    }

    const typeInfo: Pick<TypeInfo, "type" | "arrayOf" | "concreteInfo"> = {
      type: property.typeInfo.type,
      arrayOf: property.typeInfo.arrayOf
    };

    if (method) {
      typeInfo.concreteInfo = {
        registered: false,
        name: "",
        disamb: new Uint8Array(),
        prefix: new Uint8Array(),

        aminoMarshalerMethod: method.aminoMarshalerMethod,
        aminoMarshalPeprType: method.aminoMarshalPeprType
      };
    }

    registerType(constructor.prototype, typeInfo, property.name);
  };
}

// tslint:disable-next-line:function-name
export function DefineStruct(): ClassDecorator {
  // tslint:disable-next-line: ban-types
  return (constructor: Function) => {
    let structInfo: StructInfo | undefined;
    let concreteInfo: ConcreteInfo | undefined;
    if (constructor.prototype[Symbols.decoratorTypeInfos]) {
      const decoTypeInfos: DecoratorTypeInfo[] =
        constructor.prototype[Symbols.decoratorTypeInfos];
      const fields: FieldInfo[] = [];

      for (const decoTypeInfo of decoTypeInfos) {
        if (decoTypeInfo.type === "property") {
          const property = decoTypeInfo;
          fields.push(
            newFieldInfo(
              property.name,
              property.typeInfo.type,
              property.index,
              property.typeInfo.arrayOf,
              property.fieldOptions
            )
          );
        } else if (decoTypeInfo.type === "method") {
          const method = decoTypeInfo;
          if (concreteInfo) {
            throw new Error("should set only one method interface");
          }
          concreteInfo = {
            registered: false,
            name: "",
            disamb: new Uint8Array(),
            prefix: new Uint8Array(),

            aminoMarshalerMethod: method.aminoMarshalerMethod,
            aminoMarshalPeprType: method.aminoMarshalPeprType
          };
        }
      }

      if (fields.length > 0) {
        structInfo = {
          fields
        };
      }
    }

    registerStruct(constructor.prototype, {
      structInfo,
      concreteInfo
    });
  };
}

// tslint:disable-next-line:function-name
export function Concrete(name: string): ClassDecorator {
  // tslint:disable-next-line: ban-types
  return (constructor: Function) => {
    registerConcrete(name, constructor.prototype);
  };
}

type DecoratorTypeInfo = Property | Method;

interface Property {
  type: "property";
  name: string;
  index: number;
  typeInfo: Pick<TypeInfo, "type" | "arrayOf">;
  fieldOptions: Partial<FieldOptions>;
}

interface Method {
  type: "method";
  aminoMarshalerMethod: string; // name of amino marshaler method
  aminoMarshalPeprType: Pick<TypeInfo, "type" | "arrayOf">;
}

function sortDecoTypeInfos(decoTypeInfos: DecoratorTypeInfo[]) {
  decoTypeInfos.sort((a, b) => {
    if (a.type === "method") {
      return 1;
    }
    if (b.type === "method") {
      return -1;
    }
    return a.index - b.index;
  });
}

// tslint:disable-next-line:function-name
export function Property(
  type: Type,
  index: number = -1,
  arrayOf?: Pick<TypeInfo, "type" | "arrayOf">,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === "symbol") {
      throw new Error("can not set property key as symbol");
    }

    if (!target[Symbols.decoratorTypeInfos]) {
      target[Symbols.decoratorTypeInfos] = [];
    }

    const property: Property = {
      type: "property",
      name: propertyKey,
      index,
      typeInfo: {
        type,
        arrayOf
      },
      fieldOptions
    };

    const decoTypeInfos: DecoratorTypeInfo[] =
      target[Symbols.decoratorTypeInfos];
    if (index < 0) {
      let numOfProperty = 0;
      for (const decoTypeInfo of decoTypeInfos) {
        if (decoTypeInfo.type === "property") {
          numOfProperty += 1;
        }
      }
      property.index = numOfProperty;
    }

    decoTypeInfos.push(property);
    sortDecoTypeInfos(decoTypeInfos);
  };
}

// tslint:disable-next-line:function-name
function Bool(
  index: number = -1,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return Property(Type.Bool, index, undefined, fieldOptions);
}

// tslint:disable-next-line:function-name
function Int(
  index: number = -1,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return Property(Type.Int, index, undefined, fieldOptions);
}

// tslint:disable-next-line:function-name
function Int8(
  index: number = -1,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return Property(Type.Int8, index, undefined, fieldOptions);
}

// tslint:disable-next-line:function-name
function Int16(
  index: number = -1,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return Property(Type.Int16, index, undefined, fieldOptions);
}

// tslint:disable-next-line:function-name
function Int32(
  index: number = -1,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return Property(Type.Int32, index, undefined, fieldOptions);
}

// tslint:disable-next-line:function-name
function Int64(
  index: number = -1,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return Property(Type.Int64, index, undefined, fieldOptions);
}

// tslint:disable-next-line:function-name
function Uint(
  index: number = -1,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return Property(Type.Uint, index, undefined, fieldOptions);
}

// tslint:disable-next-line:function-name
function Uint8(
  index: number = -1,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return Property(Type.Uint8, index, undefined, fieldOptions);
}

// tslint:disable-next-line:function-name
function Uint16(
  index: number = -1,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return Property(Type.Uint16, index, undefined, fieldOptions);
}

// tslint:disable-next-line:function-name
function Uint32(
  index: number = -1,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return Property(Type.Uint32, index, undefined, fieldOptions);
}

// tslint:disable-next-line:function-name
function Uint64(
  index: number = -1,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return Property(Type.Uint64, index, undefined, fieldOptions);
}

// tslint:disable-next-line:function-name
function Array(
  index: number = -1,
  arrayOf: Pick<TypeInfo, "type" | "arrayOf">,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return Property(Type.Array, index, arrayOf, fieldOptions);
}

// tslint:disable-next-line:function-name
function Slice(
  index: number = -1,
  arrayOf: Pick<TypeInfo, "type" | "arrayOf">,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return Property(Type.Slice, index, arrayOf, fieldOptions);
}

// tslint:disable-next-line:function-name
function String(
  index: number = -1,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return Property(Type.String, index, undefined, fieldOptions);
}

// tslint:disable-next-line:function-name
function Defined(
  index: number = -1,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return Property(Type.Defined, index, undefined, fieldOptions);
}

// tslint:disable-next-line:function-name
function Interface(
  index: number = -1,
  fieldOptions: Partial<FieldOptions> = {}
): PropertyDecorator {
  return Property(Type.Interface, index, undefined, fieldOptions);
}

// tslint:disable-next-line:function-name
function AminoMarshaler(
  type: Pick<TypeInfo, "type" | "arrayOf">
): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): void => {
    if (typeof propertyKey === "symbol") {
      throw new Error("can not set property key as symbol");
    }

    if (!target[Symbols.decoratorTypeInfos]) {
      target[Symbols.decoratorTypeInfos] = [];
    }

    const method: Method = {
      type: "method",
      aminoMarshalerMethod: propertyKey,
      aminoMarshalPeprType: type
    };

    const decoTypeInfos: DecoratorTypeInfo[] =
      target[Symbols.decoratorTypeInfos];

    decoTypeInfos.push(method);
    sortDecoTypeInfos(decoTypeInfos);
  };
}

// tslint:disable-next-line:variable-name
export const Method = {
  AminoMarshaler
};

// tslint:disable-next-line:variable-name
export const Field = {
  Bool,
  Int,
  Int8,
  Int16,
  Int32,
  Int64,
  Uint,
  Uint8,
  Uint16,
  Uint32,
  Uint64,
  Array,
  Slice,
  String,
  Defined,
  Interface
};
