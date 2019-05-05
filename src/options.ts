import { Type } from './type'

export interface TypeInfo {
  type:Type,
  arrayOf?:Pick<TypeInfo, 'type' | 'arrayOf'>, // if type is array
  interfaceInfo?:InterfaceInfo,
  concreteInfo?:ConcreteInfo,
  structInfo?:StructInfo,
}

export interface InterfaceInfo {
  interfaceOptions:InterfaceOptions
}

export interface InterfaceOptions {
  alwaysDisambiguate:boolean
}

export interface ConcreteInfo {
  registered:boolean

  name:string
  disamb:Uint8Array
  prefix:Uint8Array

  aminoMarshalerMethod?:string // name of amino marshaler method
  aminoMarshalPeprType?:Pick<TypeInfo, 'type' | 'arrayOf'>
}

export interface StructInfo {
  fields:FieldInfo[]
}

export interface FieldInfo {
  name:string,
  type:Type,
  arrayOf?:Pick<TypeInfo, 'type' | 'arrayOf'>, // if type is array
  index:number,
  fieldOptions:FieldOptions
}

export function newFieldInfo(name:string, type:Type, index:number, arrayOf?:Pick<TypeInfo, 'type' | 'arrayOf'>, options:Partial<FieldOptions> = {}):FieldInfo {
  if (!options.jsonName) {
    options.jsonName = name
  }
  options.binFieldNum = index + 1
  return {
    name,
    type,
    arrayOf,
    index,
    fieldOptions: defaultFieldOptions(options),
  }
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

export function defaultFieldOptions(options:Partial<FieldOptions>):FieldOptions {
  const defaultOptions:FieldOptions = {
    jsonName: '',
    jsonOmitEmpty: false,
    binFixed64: false,
    binFixed32: false,
    binFieldNum: 1,

    unsafe: false,
    writeEmpty: true, // TODO: set false as default when omit empty is implemented
    emptyElements: true,
  }
  return {
    ...defaultOptions,
    ...options,
  }
}
