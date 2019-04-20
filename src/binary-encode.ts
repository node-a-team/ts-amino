import * as Encoder from './encoder'
import bigInteger from 'big-integer'
import { TypeInfo, FieldOptions } from './codec'
import { Type } from './type'

export function encodeReflectBinary(
  info:TypeInfo, value:any, fopts:FieldOptions, bare:boolean):Uint8Array {
  if (typeof value !== 'object') {
    throw new Error('not addressable')
  }
  // TODO: check value is valid / not zero value

  // TODO: handle custom amino marshaler

  switch (info.type) {
    case Type.Interface:
      throw new Error('not yet implemented')
    case Type.Array:
      throw new Error('not yet implemented')
    case Type.Slice:
      throw new Error('not yet implemented')
    case Type.Struct:
      throw new Error('not yet implemented')
    case Type.Int64:
      if (fopts.binFixed64) {
        return Encoder.encodeInt64(value)
      }
      return Encoder.encodeVarint(value)
    case Type.Int32:
      if (fopts.binFixed32) {
        return Encoder.encodeInt32(value)
      }
      return Encoder.encodeVarint(value)
    case Type.Int16:
      return Encoder.encodeInt16(value)
    case Type.Int8:
      return Encoder.encodeInt8(value)
    case Type.Int:
      return Encoder.encodeVarint(value)
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
    default:
      throw new Error('unsupported type')
  }
}
