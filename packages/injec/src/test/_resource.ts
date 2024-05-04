import {test} from "node:test"
import assert from "node:assert/strict"
import {Context, SYMBOL_CONTEXT} from "#src/context"

export class TestClass {
  string = ""
}

export interface FlatResource {
  boolean: boolean
  string: string
  number: number
  symbol: symbol
  instance: TestClass
  nonConfigurable: {}
  array: number[]
  map: Map<number, string>
  methodScalar: () => string
  methodPromiseScalar: () => Promise<string>
  methodComposite: () => {foo: string}
}

export const FLAT_RESOURCE: FlatResource = {
  boolean: false,
  string: "",
  number: 0,
  symbol: Symbol(),
  nonConfigurable: {},
  array: [1, 2],
  map: new Map([[1, "hi"]]),
  instance: new TestClass(),
  methodScalar: () => "",
  methodPromiseScalar: () => Promise.resolve(""),
  methodComposite: () => ({foo: ""}),
}

Object.defineProperty(FLAT_RESOURCE, "nonConfigurable", {
  enumerable: true,
  configurable: false,
  writable: false,
})

export interface EmptyContext {
  [SYMBOL_CONTEXT]: true
}

export type FlatContext = EmptyContext &
  FlatResource & {
    instance: TestClass & EmptyContext
    methodComposite: () => {foo: string} & EmptyContext
  }

function assertArray(value: any) {
  assert.equal(value[SYMBOL_CONTEXT], undefined, "not context")
  assert.ok(Array.isArray(value))
  assert.ok(Array.isArray(value.map((el) => el + 1)))
}

function assertScalarFunction(value: any) {
  assert.equal(typeof value, "function")
  assert.equal(value[SYMBOL_CONTEXT], undefined, "not context")
  assert.equal(typeof value(), "string", "Returns a scalar type")
}

async function assertScalarPromiseFunction(value: any) {
  assert.equal(typeof value, "function")
  assert.equal(value[SYMBOL_CONTEXT], undefined, "not context")
  assert.equal(typeof value(), "object", "Returns an object")
  assert.equal(typeof value().then, "function", "Returns a promise")
  assert.equal(
    typeof (await value()),
    "string",
    "Promise resolves with a string value",
  )
}

function assertCompositeFunction(value: any) {
  assert.equal(typeof value, "function", "Returns a method")
  assert.equal(value[SYMBOL_CONTEXT], undefined, "not context")
  assert.ok(value()[SYMBOL_CONTEXT], "Returns a context")
  assert.equal(value().foo, "", "Method returns correct value")
}

function assertInstance(value: any) {
  assert.ok(value[SYMBOL_CONTEXT], "Instance is a context")
  assert.ok(value instanceof TestClass, "Has correct constructor property")
}

export async function assertContext(
  t: {test: typeof test},
  context: Context<FlatResource>,
) {
  await t.test("Context detection", () => {
    assert.ok(context[SYMBOL_CONTEXT], "Contains IS_CONTEXT symbol")
  })

  await t.test("Property access", async (t) => {
    assert.equal(typeof context.boolean, "boolean")
    assert.equal(typeof context.string, "string")
    assert.equal(typeof context.number, "number")
    assert.equal(typeof context.symbol, "symbol")
    assert.doesNotThrow(
      () => context.nonConfigurable,
      "Can access non-configurable property",
    )
    assert.doesNotThrow(() => context.map.values(), "Can iterate over a map")

    assertArray(context.array)
    assertScalarFunction(context.methodScalar)
    await assertScalarPromiseFunction(context.methodPromiseScalar)
    assertCompositeFunction(context.methodComposite)
    assertInstance(context.instance)

    assert.equal(
      (context as any)["covfefe"],
      undefined,
      "non-existent property is undefined",
    )
  })

  await t.test("Enumeration", () => {
    const copy = {...context}
    assert.ok(
      Object.getOwnPropertyNames(copy).length >=
        Object.getOwnPropertyNames(FLAT_RESOURCE).length,
      "All enumerable properties are preserved",
    )
  })
}
