import {describe, test, expect} from "tstyche"
import {injectView, View} from "#src/view"
import {FlatResource} from "#src/test/_resource"

describe("View", () => {
  test("injectView()", () => {
    const view = injectView<FlatResource>()
    expect(view).type.toEqual<View<FlatResource>>()
  })
})
