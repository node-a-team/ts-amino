import { Type } from './type'
import { FieldInfo } from './codec'

/* TODO: var (
 *  timeType            = reflect.TypeOf(time.Time{})
 *  jsonMarshalerType   = reflect.TypeOf(new(json.Marshaler)).Elem()
 *  jsonUnmarshalerType = reflect.TypeOf(new(json.Unmarshaler)).Elem()
 *  errorType           = reflect.TypeOf(new(error)).Elem()
 *)
 */

export function checkUnsafe(field:FieldInfo) {
  if (field.unsafe) {
    return
  }
  switch (field.type) {
    case Type.Float32, Type.Float64:
      throw new Error('floating point types are unsafe for ts-amino')
  }
}

// export function slide(bz:Uint8Array, n)
