export enum Type {
  Bool = 1,
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
  Float32,
  Float64,
  Array,
  Map,
  Slice,
  String,
  Struct,
  Interface,
}

export enum Typ3 {
  Varint = 0,
  Byte8 = 1,
  ByteLength = 2,
  // Struct = 3,
  // StructTerm = 4,
  Byte4 = 5,
  // List = 6,
  // Interface = 7,
}

// tslint:disable-next-line:variable-name
export const Symbols = {
  typeInfo: Symbol('typeInfo'),
  typeToPropertyKey: Symbol('typeToPropertyKey'),
  decoratorTypeInfos: Symbol('decoratorTypeInfos'),
  fieldTypeInfoMap: Symbol('fieldTypeInfoMap'),
}

export function typ3ToString(typ3:Typ3):string {
  switch (typ3) {
    case Typ3.Varint:
      return '(U)Varint'
    case Typ3.Byte8:
      return '8Byte'
    case Typ3.ByteLength:
      return 'ByteLength'
    // case Typ3_Struct:
    //  return "Struct"
    // case Typ3_StructTerm:
    // 	return "StructTerm"
    case Typ3.Byte4:
      return '4Byte'
    // case Typ3_List:
    // 	return "List"
    // case Typ3_Interface:
    // 	return "Interface"
    default:
      return `<Invalid Typ3 ${typ3}>`
  }
}
