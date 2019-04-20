import { Buffer } from 'buffer/'
import { varint, uvarint, constants } from './varint'
import bigInteger from 'big-integer'

export function encodeInt8(i:number):Uint8Array {
  constants.mustInt8(i)
  return encodeVarint(i)
}

export function encodeInt16(i:number):Uint8Array {
  constants.mustInt16(i)
  return encodeVarint(i)
}

export function encodeInt32(i:number):Uint8Array {
  constants.mustInt32(i)
  const buf = Buffer.alloc(4)
  buf.writeIntLE(i, 0, 4)
  return buf
}

export function encodeInt64(i:number | bigInteger.BigInteger):Uint8Array {
  constants.mustInt64(i)
  let int = constants.numberToInt(i)
  if (int.isNegative()) {
    int = int.negate()
    int = int.minus(bigInteger(1))
    int = constants.MAX_UINT64.minus(int)
  }
  let buf = Buffer.from(int.toArray(256).value.reverse())
  if (buf.length > 8) {
    throw new Error('buffer overflowed')
  }
  buf = Buffer.concat([buf, Buffer.alloc(8 - buf.length)], 8)
  return buf
}

export function encodeVarint(i:number | bigInteger.BigInteger):Uint8Array {
  constants.mustInt64(i)
  const int = constants.numberToInt(i)
  return varint.encode(bigInteger(int))
}

export function varintSize(i:number | bigInteger.BigInteger):number {
  return encodeVarint(i).length
}

export function encodeByte(b:number):Uint8Array {
  constants.mustUint8(b)
  return uvarint.encode(bigInteger(b))
}

export function encodeUint8(u:number):Uint8Array {
  return encodeByte(u)
}

export function encodeUint16(u:number):Uint8Array {
  constants.mustUint16(u)
  return uvarint.encode(bigInteger(u))
}

export function encodeUint32(u:number):Uint8Array {
  constants.mustUint32(u)
  const buf = Buffer.alloc(4)
  buf.writeUIntLE(u, 0, 4)
  return buf
}

export function encodeUint64(u:number | bigInteger.BigInteger):Uint8Array {
  constants.mustUint64(u)
  const uint = constants.numberToInt(u)
  let buf = Buffer.from(uint.toArray(256).value.reverse())
  if (buf.length > 8) {
    throw new Error('buffer overflowed')
  }
  buf = Buffer.concat([buf, Buffer.alloc(8 - buf.length)], 8)
  return buf
}

export function encodeUvarint(u:number | bigInteger.BigInteger):Uint8Array {
  constants.mustUint64(u)
  const uint = constants.numberToInt(u)
  return uvarint.encode(uint)
}

export function uvarintSize(u:number | bigInteger.BigInteger):number {
  return encodeUvarint(u).length
}

export function encodeBool(b:boolean):Uint8Array {
  if (b) {
    return encodeUint8(1)
  }
  return encodeUint8(0)
}

// TODO: encodeFloat32
// TODO: encodeFloat64

// TODO: encodeTime

export function encodeByteSlice(bz:Uint8Array):Uint8Array {
  const buf = uvarint.encode(bigInteger(bz.length))
  return Buffer.concat([Buffer.from(buf), Buffer.from(bz)])
}

export function byteSliceSize(bz:Uint8Array):number {
  return encodeByteSlice(bz).length
}

export function encodeString(s:string):Uint8Array {
  return encodeByteSlice(Buffer.from(s))
}
