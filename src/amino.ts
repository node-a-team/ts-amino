import * as BinaryEncoder from './binary-encode'
import { nameToDisfix } from './codec'
import { newFieldInfo, defaultFieldOptions, TypeInfo, FieldOptions, StructInfo, FieldInfo, ConcreteInfo } from './options'
import { Type, Symbols } from './type'
import { Buffer } from 'buffer/'
import * as Encoder from './encoder'

export function marshalBinaryBare<T = any>(value:T):Uint8Array {
  if (!value) {
    throw new Error('value is null')
  }

  if (typeof value !== 'object') {
    throw new Error('only support object')
  }

  const typeInfo:TypeInfo | undefined = (value as any)[Symbols.typeInfo]
  if (!typeInfo) {
    throw new Error('type info should be set')
  }

  let bz = BinaryEncoder.encodeReflectBinary(typeInfo, value, defaultFieldOptions({ binFieldNum: 1 }), true)
  if (typeInfo.concreteInfo && typeInfo.concreteInfo.registered) {
    bz = Buffer.concat([Buffer.from(typeInfo.concreteInfo.prefix), Buffer.from(bz)])
  }

  return bz
}

export function marshalBinaryLengthPrefixed<T = any>(value:T):Uint8Array {
  let bz = marshalBinaryBare(value)
  bz = Buffer.concat([Buffer.from(Encoder.encodeUvarint(bz.length)), Buffer.from(bz)])

  return bz
}

export function registerConcrete(name:string, value:any, info:Pick<TypeInfo, Exclude<keyof TypeInfo, 'type' | 'arrayOf' | 'concreteInfo'>>) {
  if (typeof value !== 'object') {
    throw new Error('can register only object')
  }

  const disfix = nameToDisfix(name)

  if (!value[Symbols.fieldTypeInfoMap]) {
    value[Symbols.fieldTypeInfoMap] = {}
  }

  if (info.structInfo && info.structInfo.fields) {
    for (let i = 0; i < info.structInfo.fields.length; i += 1) {
      const field = info.structInfo.fields[i]
      const typeInfo:TypeInfo = {
        type: field.type,
        arrayOf: field.arrayOf,
      }
      value[Symbols.fieldTypeInfoMap][field.name] = typeInfo
    }
  }

  const concreteInfo:ConcreteInfo = {
    registered: true,
    name,
    disamb: disfix.disambBytes,
    prefix: disfix.prefixBytes,
  }
  if (value[Symbols.typeInfo]) {
    value[Symbols.typeInfo].concreteInfo = concreteInfo
  } else {
    const resultInfo:TypeInfo = {...{
      type: Type.Struct,
      concreteInfo,
    }, ...info}
    value[Symbols.typeInfo] = resultInfo
  }
}

export function registerType(value:any, info:Pick<TypeInfo, 'type' | 'arrayOf'>, propertyKey:string) {
  if (typeof value !== 'object') {
    throw new Error('can register only object')
  }

  value[Symbols.typeToPropertyKey] = propertyKey
  value[Symbols.typeInfo] = info
}

// tslint:disable-next-line:function-name
export function Define():ClassDecorator {
  return (constructor: Function) => {
    const properties:Property[] = constructor.prototype[Symbols.decoratorTypeInfos]
    if (!properties || properties.length !== 1) {
      throw new Error('should set only one property to define type')
    }

    registerType(
      constructor.prototype, {
        type: properties[0].typeInfo.type,
        arrayOf: properties[0].typeInfo.arrayOf,
      },
      properties[0].name,
    )
  }
}

// tslint:disable-next-line:function-name
export function Concrete(name:string):ClassDecorator {
  return (constructor: Function) => {
    let structInfo:StructInfo | undefined
    if (constructor.prototype[Symbols.decoratorTypeInfos]) {
      const properties:Property[] = constructor.prototype[Symbols.decoratorTypeInfos]
      const fields:FieldInfo[] = []

      for (let i = 0; i < properties.length; i += 1) {
        const property = properties[i]

        fields.push(newFieldInfo(property.name, property.typeInfo.type, property.index, property.typeInfo.arrayOf,  property.fieldOptions))
      }

      if (fields.length > 0) {
        structInfo = {
          fields,
        }
      }
    }

    registerConcrete(name, constructor.prototype, {
      structInfo,
    })
  }
}

interface Property {
  name:string,
  index:number,
  typeInfo:Pick<TypeInfo, 'type' | 'arrayOf'>
  fieldOptions: Partial<FieldOptions>
}

// tslint:disable-next-line:function-name
export function Property(type:Type, index:number = -1, arrayOf?:Type, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'symbol') {
      throw new Error('can not set property key as symbol')
    }

    if (!target[Symbols.decoratorTypeInfos]) {
      target[Symbols.decoratorTypeInfos] = []
    }

    const property:Property = {
      name: propertyKey,
      index,
      typeInfo: {
        type,
        arrayOf,
      },
      fieldOptions,
    }

    const properties:Property[] = target[Symbols.decoratorTypeInfos]
    if (index >= 0) {
      target[Symbols.decoratorTypeInfos] = properties.slice(0, index).concat([property], properties.slice(index))
    } else {
      property.index = properties.length
      properties.push(property)
    }
  }
}

// tslint:disable-next-line:function-name
function Bool(index:number = -1, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return Property(Type.Bool, index, undefined, fieldOptions)
}

// tslint:disable-next-line:function-name
function Int(index:number = -1, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return Property(Type.Int, index, undefined, fieldOptions)
}

// tslint:disable-next-line:function-name
function Int8(index:number = -1, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return Property(Type.Int8, index, undefined, fieldOptions)
}

// tslint:disable-next-line:function-name
function Int16(index:number = -1, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return Property(Type.Int16, index, undefined, fieldOptions)
}

// tslint:disable-next-line:function-name
function Int32(index:number = -1, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return Property(Type.Int32, index, undefined, fieldOptions)
}

// tslint:disable-next-line:function-name
function Int64(index:number = -1, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return Property(Type.Int64, index, undefined, fieldOptions)
}

// tslint:disable-next-line:function-name
function Uint(index:number = -1, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return Property(Type.Uint, index, undefined, fieldOptions)
}

// tslint:disable-next-line:function-name
function Uint8(index:number = -1, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return Property(Type.Uint8, index, undefined, fieldOptions)
}

// tslint:disable-next-line:function-name
function Uint16(index:number = -1, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return Property(Type.Uint16, index, undefined, fieldOptions)
}

// tslint:disable-next-line:function-name
function Uint32(index:number = -1, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return Property(Type.Uint32, index, undefined, fieldOptions)
}

// tslint:disable-next-line:function-name
function Uint64(index:number = -1, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return Property(Type.Uint64, index, undefined, fieldOptions)
}

// tslint:disable-next-line:function-name
function Array(index:number = -1, arrayOf:Type, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return Property(Type.Array, index, arrayOf, fieldOptions)
}

// tslint:disable-next-line:function-name
function Slice(index:number = -1, arrayOf:Type, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return Property(Type.Slice, index, arrayOf, fieldOptions)
}

// tslint:disable-next-line:function-name
function String(index:number = -1, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return Property(Type.String, index, undefined, fieldOptions)
}

// tslint:disable-next-line:function-name
function Struct(index:number = -1, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return Property(Type.Struct, index, undefined, fieldOptions)
}

// tslint:disable-next-line:function-name
function Interface(index:number = -1, fieldOptions:Partial<FieldOptions> = {}):PropertyDecorator {
  return Property(Type.Interface, index, undefined, fieldOptions)
}

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
  Struct,
  Interface,
}
