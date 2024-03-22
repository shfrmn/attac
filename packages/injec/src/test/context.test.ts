import {test} from "node:test"
import assert from "node:assert/strict"
import {createContext, SYMBOL_CONTEXT} from "#src/context"
import {injectView} from "#src/view"
import {FLAT_RESOURCE, assertContext} from "#src/test/_resource"

test("createContext()", async (t) => {
  await t.test("Flat", async (t) => {
    const context = createContext(
      FLAT_RESOURCE,
      [],
      null,
      (state, getContext) => getContext(state),
      null,
    )

    await assertContext(t, context)
  })

  await t.test("Nested", async (t) => {
    class Nested {
      context = injectView<typeof NESTED_RESOURCE>()
    }
    const NESTED_RESOURCE = {
      ...FLAT_RESOURCE,
      nested: new Nested(),
    }
    const context = createContext(
      NESTED_RESOURCE,
      [],
      null,
      (state, getContext) => getContext(state),
      null,
    )

    await t.test("Top-level context", async (t) => {
      await assertContext(t, context)
    })

    await t.test("Second-level context", async (t) => {
      assert.ok(context.nested.context[SYMBOL_CONTEXT])
      await assertContext(t, context.nested.context)
    })
  })
})
