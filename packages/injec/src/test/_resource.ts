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
  methodScalar: () => string
  methodComposite: () => {foo: string}
}

export const FLAT_RESOURCE: FlatResource = {
  boolean: false,
  string: "",
  number: 0,
  symbol: Symbol(),
  instance: new TestClass(),
  methodScalar: () => "",
  methodComposite: () => ({foo: ""}),
}

export interface EmptyContext {
  [SYMBOL_CONTEXT]: true
}

export type FlatContext = EmptyContext &
  FlatResource & {
    instance: TestClass & EmptyContext
    methodComposite: () => {foo: string} & EmptyContext
  }

function assertScalarFunction(value: any) {
  assert.equal(typeof value, "function")
  assert.equal(value[SYMBOL_CONTEXT], undefined, "not context")
  assert.equal(typeof value(), "string", "Returns a scalar type")
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

    assertScalarFunction(context.methodScalar)
    assertCompositeFunction(context.methodComposite)
    assertInstance(context.instance)

    assert.equal(
      (context as any)["covfefe"],
      undefined,
      "non-existent property is undefined",
    )
  })
}
