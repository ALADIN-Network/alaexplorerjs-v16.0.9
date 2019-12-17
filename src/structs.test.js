/* eslint-env mocha */
const assert = require('assert')
const Fcbuffer = require('alafcbuffer22')
const ByteBuffer = require('bytebuffer')

const Ala = require('.')

describe('shorthand', () => {

  it('authority', async () => {
    const ala = Ala({keyPrefix: 'PUB'})
    const alaio = await ala.contract('alaio')
    const {authority} = alaio.fc.structs

    const pubkey = 'PUB6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'
    const auth = {threshold: 1, keys: [{key: pubkey, weight: 1}]}

    assert.deepEqual(authority.fromObject(pubkey), auth)
    assert.deepEqual(
      authority.fromObject(auth),
      Object.assign({}, auth, {accounts: [], waits: []})
    )
  })

  it('PublicKey sorting', async () => {
    const ala = Ala()
    const alaio = await ala.contract('alaio')
    const {authority} = alaio.fc.structs

    const pubkeys = [
      'ALA7wBGPvBgRVa4wQN2zm5CjgBF6S7tP7R3JavtSa2unHUoVQGhey',
      'ALA8dM36QedcUfPTNF7maThtRqHP5xvCqMsYiHUz1Rz7sPfhvCYuo'
    ]

    const authSorted = {threshold: 1, keys: [
      {key: pubkeys[1], weight: 1},
      {key: pubkeys[0], weight: 1}
    ], accounts: [], waits: []}

    const authUnsorted = {threshold: 1, keys: [
      {key: pubkeys[0], weight: 1},
      {key: pubkeys[1], weight: 1}
    ], accounts: [], waits: []}

    // assert.deepEqual(authority.fromObject(pubkey), auth)
    assert.deepEqual(authority.fromObject(authUnsorted), authSorted)
  })

  it('public_key', () => {
    const ala = Ala({keyPrefix: 'PUB'})
    const {structs, types} = ala.fc
    const PublicKeyType = types.public_key()
    const pubkey = 'PUB6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'
    // 02c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf
    assertSerializer(PublicKeyType, pubkey)
  })

  it('symbol', () => {
    const ala = Ala()
    const {types} = ala.fc
    const Symbol = types.symbol()
    assertSerializer(Symbol, '4,SYS', '4,SYS', 'SYS')
  })

  it('symbol_code', () => {
    const ala = Ala({defaults: true})
    const {types} = ala.fc
    const SymbolCode = types.symbol_code()
    assertSerializer(SymbolCode, SymbolCode.toObject())
  })

  it('extended_symbol', () => {
    const ala = Ala({defaults: true})
    const esType = ala.fc.types.extended_symbol()
    // const esString = esType.toObject()
    assertSerializer(esType, '4,SYS@contract')
  })

  it('asset', () => {
    const ala = Ala()
    const {types} = ala.fc
    const aType = types.asset()
    assertSerializer(aType, '1.0001 SYS')
  })

  it('extended_asset', () => {
    const ala = Ala({defaults: true})
    const eaType = ala.fc.types.extended_asset()
    assertSerializer(eaType, eaType.toObject())
  })

  it('signature', () => {
    const ala = Ala()
    const {types} = ala.fc
    const SignatureType = types.signature()
    const signatureString = 'SIG_K1_JwxtqesXpPdaZB9fdoVyzmbWkd8tuX742EQfnQNexTBfqryt2nn9PomT5xwsVnUB4m7KqTgTBQKYf2FTYbhkB5c7Kk9EsH'
    //const signatureString = 'SIG_K1_Jzdpi5RCzHLGsQbpGhndXBzcFs8vT5LHAtWLMxPzBdwRHSmJkcCdVu6oqPUQn1hbGUdErHvxtdSTS1YA73BThQFwV1v4G5'
    assertSerializer(SignatureType, signatureString)
  })

})

describe('Alaio Abi', () => {

  function checkContract(name) {
    it(`${name} contract parses`, (done) => {
      const ala = Ala()

      ala.contract('alaio.token', (error, alaio_token) => {
        assert(!error, error)
        assert(alaio_token.transfer, 'alaio.token contract')
        assert(alaio_token.issue, 'alaio.token contract')
        done()
      })
    })
  }
  checkContract('alaio')
  checkContract('alaio.token')

  it('abi', async () => {
    const ala = Ala({defaults: true, broadcast: false, sign: false})

    const {abi_def} = ala.fc.structs

    async function setabi(abi) {
      await ala.setabi('inita', abi) // See README
      const buf = ala.fc.toBuffer('abi_def', abi)
      await ala.setabi('inita', buf) // v1/chain/abi_json_to_bin
      await ala.setabi('inita', buf.toString('hex')) // v1/chain/abi_json_to_bin
    }

    const obj = abi_def.toObject()
    const json = JSON.stringify(obj)

    await setabi(obj)
    await setabi(abi_def.fromObject(obj))
    await setabi(abi_def.fromObject(json))
    await setabi(abi_def.fromObject(Buffer.from(json).toString('hex')))
    await setabi(abi_def.fromObject(Buffer.from(json)))
  })
})

describe('Action.data', () => {
  it('json', () => {
    const ala = Ala({forceActionDataHex: false})
    const {structs, types} = ala.fc
    const value = {
      account: 'alaio.token',
      name: 'transfer',
      data: {
        from: 'inita',
        to: 'initb',
        quantity: '1.0000 SYS',
        memo: ''
      },
      authorization: []
    }
    assertSerializer(structs.action, value)
  })

  it('force hex', () => {
    const ala = Ala({forceActionDataHex: true})
    const {structs, types} = ala.fc
    const value = {
      account: 'alaio.token',
      name: 'transfer',
      data: {
        from: 'inita',
        to: 'initb',
        quantity: '1.0000 SYS',
        memo: ''
      },
      authorization: []
    }
    assertSerializer(structs.action, value, value)
  })

  it('unknown action', () => {
    const ala = Ala({forceActionDataHex: false})
    const {structs, types} = ala.fc
    const value = {
      account: 'alaio.token',
      name: 'mytype',
      data: '030a0b0c',
      authorization: []
    }
    assert.throws(
      () => assertSerializer(structs.action, value),
      /Missing ABI action/
    )
  })
})

function assertSerializer (type, value, fromObjectResult = null, toObjectResult = fromObjectResult) {
  const obj = type.fromObject(value) // tests fromObject
  const buf = Fcbuffer.toBuffer(type, value) // tests appendByteBuffer
  const obj2 = Fcbuffer.fromBuffer(type, buf) // tests fromByteBuffer
  const obj3 = type.toObject(obj) // tests toObject

  if(!fromObjectResult && !toObjectResult) {
    assert.deepEqual(value, obj3, 'serialize object')
    assert.deepEqual(obj3, obj2, 'serialize buffer')
    return
  }

  if(fromObjectResult) {
    assert(fromObjectResult, obj, 'fromObjectResult')
    assert(fromObjectResult, obj2, 'fromObjectResult')
  }

  if(toObjectResult) {
    assert(toObjectResult, obj3, 'toObjectResult')
  }
}
