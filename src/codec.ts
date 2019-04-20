import { Buffer } from 'buffer/'
import { sha256 } from 'sha.js'
import { Type } from './type'

export const prefixBytesLen = 4
export const disambBytesLen = 3
export const disfixBytesLen = prefixBytesLen + disambBytesLen

export function nameToDisfix(name:string):{disambBytes:Uint8Array, prefixBytes:Uint8Array} {
  const buffer:Buffer = Buffer.from((new sha256).update(name).digest('hex'), 'hex')
  let i = 0
  while (buffer[i] === 0) {
    i += 1
  }
  const disambBytes = new Uint8Array(buffer.slice(i, i + disambBytesLen))

  while (buffer[i] === 0) {
    i += 1
  }
  const prefixBytes = new Uint8Array(buffer.slice(i, i + prefixBytesLen))

  return {
    disambBytes,
    prefixBytes,
  }
}

export interface TypeInfo {
  type:Type,
}

export interface InterfaceInfo {
  priority:Uint8Array       // Disfix priority.
}

export interface InterfaceOption {
  priority:Uint8Array
}

export interface ConcreteInfo {

}

export interface FieldInfo extends FieldOptions {
  name:string,
  type:Type,
  index:number,
}

export interface FieldOptions {
  jsonName:string,
  jsonOmitEmpty:boolean,
  binFixed64:boolean,
  binFixed32:boolean,
  binFieldNum:number,

  unsafe:boolean,
  writeEmpty:boolean,
  emptyElements:boolean,
}
