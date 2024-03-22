import {test} from "node:test"
import assert from "node:assert/strict"
import {SYMBOL_CONTEXT, createContext} from "#src/context"
import {injectView} from "#src/view"
import {FLAT_RESOURCE} from "#src/test/_resource"

test("Hook", async (t) => {
  await t.test("NOT invoked for scalar fields", async (t) => {
    const hook = t.mock.fn((state, getContext) => getContext(state))
    const context = createContext(FLAT_RESOURCE, [], null, hook, null)
    propAccess: {
      context.boolean
      context.number
      context.string
      context.symbol
    }
    assert.equal(hook.mock.callCount(), 0)
  })

  await t.test("Invoked for functions [scalar return type]", async (t) => {
    const hook = t.mock.fn((state, getContext) => getContext(state))
    const context = createContext(FLAT_RESOURCE, [], null, hook, null)
    propAccess: {
      context.methodScalar()
    }
    assert.equal(hook.mock.callCount(), 1, "Hook is called once")
  })

  await t.test("Invoked for functions [composite return type]", async (t) => {
    const hook = t.mock.fn((state, getContext) => getContext(state))
    const context = createContext(FLAT_RESOURCE, [], null, hook, null)
    propAccess: {
      context.methodComposite().foo
    }
    assert.equal(hook.mock.callCount(), 1, "Hook is called once")
  })

  await t.test("Invoked for class instances", async (t) => {
    const hook = t.mock.fn((state, getContext) => getContext(state))
    const context = createContext(FLAT_RESOURCE, [], null, hook, null)
    propAccess: {
      context.instance.string
    }
    assert.equal(hook.mock.callCount(), 1, "Hook is called once")
  })

  await t.test("When entering nested context", async (t) => {
    const hook = t.mock.fn((state, getContext, path) => getContext(state))
    class Nested {
      context = injectView<typeof NESTED_RESOURCE>()
    }
    const NESTED_RESOURCE = {
      ...FLAT_RESOURCE,
      nested: new Nested(),
    }
    const context = createContext(NESTED_RESOURCE, [], null, hook, null)
    propAccess: {
      context.nested.context
    }

    await t.test("Hook is invoked", async (t) => {
      assert.equal(hook.mock.callCount(), 2)
    })
    await t.test("Hook receives context boundary symbol", async (t) => {
      assert.deepEqual(hook.mock.calls[1]?.arguments[2], [
        "nested",
        "context",
        SYMBOL_CONTEXT,
      ])
    })
  })
})
