import {test} from "node:test"
import assert from "node:assert/strict"
import {SYMBOL_CONTEXT, View} from "@attac/injec"
import {rbac, injectRbac} from "#src/index"

test("rbac()", async (t) => {
  await t.test("Returns login function", () => {
    const logIn = rbac({}, {})
    assert.equal(typeof logIn, "function")
  })

  await t.test("Login function", async (t) => {
    await t.test("Returns context", () => {
      const logIn = rbac({hello: "world"}, {admin: {hello: true}})
      const context = logIn("admin")
      assert.ok((context as any)[SYMBOL_CONTEXT])
    })
  })

  await t.test("Login context", async (t) => {
    await t.test("Has resource properties", () => {
      const logIn = rbac({hello: "world"}, {admin: {hello: true}})
      const context = logIn("admin")
      assert.ok(context.hello)
    })

    await t.test("Doesn't have roles as properties", () => {
      const logIn = rbac({hello: "world"}, {admin: {hello: true}})
      const context = logIn("admin")
      assert.equal((context as any).admin, undefined)
    })

    await t.test("Nested login context", async (t) => {
      class Nested {
        context = injectRbac<typeof logIn>()
      }
      const logIn = rbac(
        {hello: "world", nested: new Nested()},
        {admin: {hello: true, nested: true}},
      )
      const context = logIn("admin")
      assert.ok(context.nested.context.hello)
    })
  })
})

test("injectRbac()", async (t) => {
  await t.test("Returns a view", () => {
    const logIn = rbac({}, {})
    const view = injectRbac<typeof logIn>()
    assert.ok(view instanceof View)
  })
})
