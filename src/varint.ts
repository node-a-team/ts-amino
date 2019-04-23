import bigInteger from 'big-integer'
import { Buffer } from 'buffer/'

const MAX_UINT8 = bigInteger('255')
const MAX_INT8 = bigInteger('127')
const MIN_INT8 = bigInteger('128').negate()

const MAX_UINT16 = bigInteger('65535')
const MAX_INT16 = bigInteger('32767')
const MIN_INT16 = bigInteger('32768').negate()

const MAX_UINT32 = bigInteger('4294967295')
const MAX_INT32 = bigInteger('2147483647')
const MIN_INT32 = bigInteger('2147483648').negate()

const MAX_UINT64 = bigInteger('18446744073709551615')
const MAX_INT64 = bigInteger('9223372036854775807')
const MIN_INT64 = bigInteger('9223372036854775808').negate()

const UINT64_BIT64 = bigInteger(1).shiftLeft(bigInteger(63))

const uvarint = {
  encode(integer:bigInteger.BigInteger):Uint8Array {
    if (integer.isNegative()) {
      throw new Error('uinteger shouldn\'t be negative')
    }
    if (integer.bitLength().greater(bigInteger(64))) {
      throw new Error('integer is too big')
    }
    const buf = Buffer.alloc(10)
    let tempInt = integer
    let i = 0
    while (tempInt.geq(bigInteger(0x80))) {
      buf[i] = tempInt.mod(0x80).or(0x80).toJSNumber()
      tempInt = tempInt.shiftRight(7)
      i += 1
    }
    buf[i] = tempInt.toJSNumber()
    return buf.slice(0, i + 1)
  },
  decode(buf:Uint8Array):bigInteger.BigInteger {
    let int = bigInteger(0)
    let s = 0
    for (let index = 0; index < buf.length; index += 1) {
      const byte = buf[index]
      if (byte < 0x80) {
        if (index > 9 || index === 9 && byte > 1) {
          throw new Error('uvarint overflowed')
        }
        return int.or(bigInteger(byte).shiftLeft(s))
      }
      int = int.or(bigInteger(byte & 0x7f).shiftLeft(s))
      s += 7
    }
    throw new Error('buffer may be empty')
  },
}

const varint = {
  encode(integer:bigInteger.BigInteger):Uint8Array {
    if (integer.bitLength().greater(bigInteger(64))) {
      throw new Error('integer is too big')
    }
    mustInt64(integer)

    let tempInt = integer
    if (integer.isNegative()) {
      // make integer to uint64 except signed bit
      tempInt = int64ToUint64(tempInt)
      tempInt = tempInt.minus(UINT64_BIT64)

      tempInt = tempInt.shiftLeft(1)
      tempInt = MAX_UINT64.minus(tempInt)
    } else {
      tempInt = integer.shiftLeft(1)
    }
    return uvarint.encode(tempInt)
  },
  decode(buf:Uint8Array):bigInteger.BigInteger {
    const tempInt = uvarint.decode(buf)
    let int = tempInt.shiftRight(1)
    // if negative
    if (tempInt.and(1).notEquals(bigInteger(0))) {
      int = int.plus(bigInteger(1))
      int = int.negate()
    }
    return int
  },
}

function int64ToUint64(int64: bigInteger.BigInteger):bigInteger.BigInteger {
  if (int64.isNegative()) {
    let uint64 = int64.negate()
    uint64 = uint64.minus(bigInteger(1))
    uint64 = MAX_UINT64.minus(uint64)
    return uint64
  }
  return int64
}

function numberToInt(num:number | bigInteger.BigInteger) {
  let tempInt:bigInteger.BigInteger
  if (typeof num === 'bigint') {
    tempInt = num
  } else {
    tempInt = bigInteger(num as number)
  }
  return tempInt
}

function mustInt8(int:number | bigInteger.BigInteger) {
  const tempInt = numberToInt(int)
  if (tempInt.greater(MAX_INT8) || tempInt.lesser(MIN_INT8)) {
    throw new Error('out of range')
  }
}

function mustUint8(int:number | bigInteger.BigInteger) {
  const tempInt = numberToInt(int)
  if (tempInt.greater(MAX_UINT8) || tempInt.lesser(bigInteger(0))) {
    throw new Error('out of range')
  }
}

function mustInt16(int:number | bigInteger.BigInteger) {
  const tempInt = numberToInt(int)
  if (tempInt.greater(MAX_INT16) || tempInt.lesser(MIN_INT16)) {
    throw new Error('out of range')
  }
}

function mustUint16(int:number | bigInteger.BigInteger) {
  const tempInt = numberToInt(int)
  if (tempInt.greater(MAX_UINT16) || tempInt.lesser(bigInteger(0))) {
    throw new Error('out of range')
  }
}

function mustInt32(int:number | bigInteger.BigInteger) {
  const tempInt = numberToInt(int)
  if (tempInt.greater(MAX_INT32) || tempInt.lesser(MIN_INT32)) {
    throw new Error('out of range')
  }
}

function mustUint32(int:number | bigInteger.BigInteger) {
  const tempInt = numberToInt(int)
  if (tempInt.greater(MAX_UINT32) || tempInt.lesser(bigInteger(0))) {
    throw new Error('out of range')
  }
}

function mustInt64(int:number | bigInteger.BigInteger) {
  const tempInt = numberToInt(int)
  if (tempInt.greater(MAX_INT64) || tempInt.lesser(MIN_INT64)) {
    throw new Error('out of range')
  }
}

function mustUint64(int:number | bigInteger.BigInteger) {
  const tempInt = numberToInt(int)
  if (tempInt.greater(MAX_UINT64) || tempInt.lesser(bigInteger(0))) {
    throw new Error('out of range')
  }
}

const constants = {
  MAX_UINT8,
  MAX_INT8,
  MIN_INT8,
  MAX_UINT16,
  MAX_INT16,
  MIN_INT16,
  MAX_UINT32,
  MAX_INT32,
  MIN_INT32,
  MAX_UINT64,
  MAX_INT64,
  MIN_INT64,
  int64ToUint64,
  numberToInt,
  mustInt8,
  mustUint8,
  mustInt16,
  mustUint16,
  mustInt32,
  mustUint32,
  mustInt64,
  mustUint64,
}

export {
  uvarint,
  varint,
  constants,
}
