import {test} from "node:test"
import assert from "node:assert/strict"
import {injectView, View} from "#src/view"
import {FlatContext} from "#src/test/_resource"

test("injectView()", async (t) => {
  const view = injectView<FlatContext>()

  await t.test("Returns an instance of View", () => {
    assert.ok(view instanceof View)
  })
})
