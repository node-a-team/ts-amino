import { Type, Typ3 } from './type'
import { FieldInfo, FieldOptions } from './options'

/* TODO: var (
 *  timeType            = reflect.TypeOf(time.Time{})
 *  jsonMarshalerType   = reflect.TypeOf(new(json.Marshaler)).Elem()
 *  jsonUnmarshalerType = reflect.TypeOf(new(json.Unmarshaler)).Elem()
 *  errorType           = reflect.TypeOf(new(error)).Elem()
 *)
 */

export function checkUnsafe(field:FieldInfo) {
  if (field.fieldOptions.unsafe) {
    return
  }
  switch (field.type) {
    case Type.Float32, Type.Float64:
      throw new Error('floating point types are unsafe for ts-amino')
  }
}

// export function slide(bz:Uint8Array, n)

export function typeToTyp3(type:Type, opts:FieldOptions):Typ3 {
  switch (type) {
    case Type.Interface:
      return Typ3.ByteLength
    case Type.Array:
    case Type.Slice:
      return Typ3.ByteLength
    case Type.String:
      return Typ3.ByteLength
    case Type.Struct:
    case Type.Map:
      return Typ3.ByteLength
    case Type.Int64:
    case Type.Uint64:
      if (opts.binFixed64) {
        return Typ3.Byte8
      }
      return Typ3.Varint
    case Type.Int32:
    case Type.Uint32:
      if (opts.binFixed32) {
        return Typ3.Byte4
      }
      return Typ3.Varint
    case Type.Int16:
    case Type.Int8:
    case Type.Int:
    case Type.Uint16:
    case Type.Uint8:
    case Type.Uint:
    case Type.Bool:
      return Typ3.Varint
    case Type.Float64:
      return Typ3.Byte8
    case Type.Float32:
      return Typ3.Byte4
    default:
      throw new Error(`unsupported field type ${type}`)
  }
}
