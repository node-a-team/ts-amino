import 'mocha'
import { Concrete, Field, marshalBinaryBare } from './amino'
import bigInteger from 'big-integer'

@Concrete('test')
class Test {
  @Field.Int64()
  int64:bigInteger.BigInteger = bigInteger(4230802)

  @Field.Uint16()
  uint16:number = 10
}

@Concrete('concrete-with-struct')
class Test2 {
  @Field.Struct()
  test:Test = new Test()
}

@Concrete('concrete-with-interface')
class Test3 {
  @Field.Interface()
  test:Test = new Test()
}

describe('Test amino', () => {
  it('test decorator', () => {
    const test = new Test()

    const bz = marshalBinaryBare(test)

    console.log(Buffer.from(bz).toString('hex'))
  })

  it('test concrete with struct', () => {
    const test = new Test2()

    const bz = marshalBinaryBare(test)

    console.log(Buffer.from(bz).toString('hex'))
  })

  it('test concrete with interface', () => {
    const test = new Test3()

    const bz = marshalBinaryBare(test)

    console.log(Buffer.from(bz).toString('hex'))
  })
})
