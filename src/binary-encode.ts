import * as Encoder from './encoder'
import bigInteger from 'big-integer'
import { uvarint, constants } from './varint'
import { TypeInfo, FieldOptions } from './options'
import { Type, Typ3 } from './type'
import { Buffer } from 'buffer/'
import { typeToTyp3 } from './reflect'
import { getTypeInfo, deferTypeInfo } from './codec'

// tslint:disable-next-line:max-line-length
export function encodeReflectBinary(info:TypeInfo, value:any, fopts:FieldOptions, bare:boolean):Uint8Array {
  const [deferedInfo, deferedValue] = deferTypeInfo(info, value, '')
  // tslint:disable-next-line:no-parameter-reassignment
  info = deferedInfo
  // tslint:disable-next-line:no-parameter-reassignment
  value = deferedValue

  // TODO: check value is valid / not zero value

  if (info.concreteInfo) {
    const concreteInfo = info.concreteInfo
    if (concreteInfo.aminoMarshalerMethod && concreteInfo.aminoMarshalPeprType) {
      // tslint:disable-next-line:no-parameter-reassignment
      value = value[info.concreteInfo.aminoMarshalerMethod!]()

      // tslint:disable-next-line:no-parameter-reassignment
      info = {
        type: concreteInfo.aminoMarshalPeprType.type,
        arrayOf: concreteInfo.aminoMarshalPeprType.arrayOf,
      }

      return encodeReflectBinary(info, value, fopts, bare)
    }
  }

  switch (info.type) {
    case Type.Interface:
      return encodeReflectBinaryInterface(info, value, fopts, bare)
    case Type.Array:
      if (value instanceof Uint8Array || (info.arrayOf && info.arrayOf.type === Type.Uint8)) {
        return encodeReflectBinaryByteArray(info, value, fopts)
      }
      return encodeReflectBinaryList(info, value, fopts, bare)
    case Type.Slice:
      if (value instanceof Uint8Array || (info.arrayOf && info.arrayOf.type === Type.Uint8)) {
        return encodeReflectBinaryByteSlice(info, value, fopts)
      }
      return encodeReflectBinaryList(info, value, fopts, bare)
    case Type.Struct:
      return encodeReflectBinaryStruct(info, value, fopts, bare)
    case Type.Int64:
      if (fopts.binFixed64) {
        return Encoder.encodeInt64(value)
      }
      return Encoder.encodeUvarint(constants.int64ToUint64(value))
    case Type.Int32:
      if (fopts.binFixed32) {
        return Encoder.encodeInt32(value)
      }
      return Encoder.encodeUvarint(constants.int64ToUint64(value))
    case Type.Int16:
      return Encoder.encodeInt16(value)
    case Type.Int8:
      return Encoder.encodeInt8(value)
    case Type.Int:
      return Encoder.encodeUvarint(constants.int64ToUint64(value))
    case Type.Uint64:
      if (fopts.binFixed64) {
        return Encoder.encodeUint64(value)
      }
      Encoder.encodeUvarint(value)
    case Type.Uint32:
      if (fopts.binFixed32) {
        return Encoder.encodeUint32(value)
      }
      return Encoder.encodeUvarint(value)
    case Type.Uint16:
      return Encoder.encodeUint16(value)
    case Type.Uint8:
      return Encoder.encodeUint8(value)
    case Type.Uint:
      return Encoder.encodeUvarint(value)
    case Type.Bool:
      return Encoder.encodeBool(value)
    case Type.Float64:
      throw new Error('not yet implemented')
    case Type.Float32:
      throw new Error('not yet implemented')
    case Type.String:
      return Encoder.encodeString(value)
    case Type.Defined:
      throw new Error('can\'t get a type from child object')
    default:
      throw new Error('unsupported type')
  }
}

function encodeReflectBinaryInterface(iinfo:TypeInfo, value:any, fopts:FieldOptions, bare:boolean):Uint8Array {
  if (!value) {
    return new Uint8Array(1)  // 0x00
  }

  const cinfo:TypeInfo | undefined = getTypeInfo(value)
  if (!cinfo || !cinfo.concreteInfo || !cinfo.concreteInfo.registered) {
    throw new Error('Cannot encode unregistered concrete type')
  }

  let buf:Buffer = Buffer.alloc(0)

  let needDisamb = false
  if (iinfo.interfaceInfo && iinfo.interfaceInfo.interfaceOptions.alwaysDisambiguate) {
    needDisamb = true
  }
  // TODO: judge whether disamb is necessary https://github.com/tendermint/go-amino/blob/master/binary-encode.go#L211

  if (needDisamb) {
    buf = Buffer.concat([Buffer.alloc(1), Buffer.from(cinfo.concreteInfo.disamb)])
  }

  buf = Buffer.concat([buf, Buffer.from(cinfo.concreteInfo.prefix)])

  buf = Buffer.concat([buf, Buffer.from(encodeReflectBinary(cinfo, value, fopts, true))])

  if (bare) {
    return buf
  }
  return Encoder.encodeByteSlice(buf)
}

function encodeReflectBinaryByteArray(info:TypeInfo, value:any, fopts:FieldOptions):Uint8Array {
  return Encoder.encodeByteSlice(value)
}

function encodeReflectBinaryList(info:TypeInfo, value:any[], fopts:FieldOptions, bare:boolean):Uint8Array {
  if (!info.arrayOf) {
    throw new Error('should set a type of array element')
  }
  const etype = info.arrayOf!
  const einfo:TypeInfo = {
    type: etype.type,
    arrayOf: etype.arrayOf,
  }

  let buf = Buffer.alloc(0)

  const typ3 = typeToTyp3(einfo.type, fopts)
  if (typ3 !== Typ3.ByteLength) {
    for (let i = 0; i < value.length; i += 1) {
      buf = Buffer.concat([buf, Buffer.from(encodeReflectBinary(einfo, value[i], fopts, false))])
    }
  } else {
    for (let i = 0; i < value.length; i += 1) {
      buf = Buffer.concat([buf, Buffer.from(encodeFieldNumberAndTyp3(fopts.binFieldNum, Typ3.ByteLength))])

      // TODO: handling default https://github.com/tendermint/go-amino/blob/master/binary-encode.go#L311

      const efopts = {
        ...fopts,
        ...{
          binFieldNum: 1,
        },
      }
      buf = Buffer.concat([buf, Buffer.from(encodeReflectBinary(einfo, value[i], efopts, false))])
    }
  }

  if (bare) {
    return buf
  }
  return Encoder.encodeByteSlice(buf)
}

function encodeReflectBinaryByteSlice(info:TypeInfo, value:any, fopts:FieldOptions):Uint8Array {
  return Encoder.encodeByteSlice(value)
}

// tslint:disable-next-line:max-line-length
function encodeReflectBinaryStruct(info:TypeInfo, value:any, fopts:FieldOptions, bare:boolean):Uint8Array {
  let buf = Buffer.alloc(0)

  switch (info.type) {
    // case Type.time:
    //  TODO
    default:
      if (!info.structInfo) {
        throw new Error('should set types of struct elements')
      }

      for (let i = 0; i < info.structInfo.fields.length; i += 1) {
        const field = info.structInfo.fields[i]
        let [finfo, frv] = deferTypeInfo(info, value, field.name)

        if (finfo.concreteInfo) {
          const concreteInfo = finfo.concreteInfo
          if (concreteInfo.aminoMarshalerMethod && concreteInfo.aminoMarshalPeprType) {
            frv = frv[finfo.concreteInfo.aminoMarshalerMethod!]()

            finfo = {
              type: concreteInfo.aminoMarshalPeprType.type,
              arrayOf: concreteInfo.aminoMarshalPeprType.arrayOf,
            }
          }
        }

        // TODO: handling default https://github.com/tendermint/go-amino/blob/master/binary-encode.go#L404

        // TODO: handling unpacked list https://github.com/tendermint/go-amino/blob/master/binary-encode.go#L409

        buf = Buffer.concat([buf, Buffer.from(encodeFieldNumberAndTyp3(field.fieldOptions.binFieldNum, typeToTyp3(finfo!.type, field.fieldOptions)))])

        buf = Buffer.concat([buf, Buffer.from(encodeReflectBinary(finfo, frv, field.fieldOptions, false))])

        // TODO: ??? https://github.com/tendermint/go-amino/blob/master/binary-encode.go#L431
      }
  }

  if (bare) {
    return buf
  }
  return Encoder.encodeByteSlice(buf)
}

function encodeFieldNumberAndTyp3(num:number, typ3:Typ3):Uint8Array {
  constants.mustUint32(num)
  if ((typ3 & 0xF8) !== 0) {
    throw new Error(`invalid Typ3 byte ${typ3}`)
  }
  // TODO: if num is greater than 1<<29-1, throw error

  const value64 = (num << 3) | typ3

  return uvarint.encode(bigInteger(value64))
}
