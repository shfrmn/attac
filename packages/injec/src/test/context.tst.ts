import {describe, test, expect} from "tstyche"
import {Context, createContext} from "#src/context"
import {View, injectView} from "#src/view"
import {FLAT_RESOURCE, FlatResource, FlatContext} from "test/_resource"

describe("Context", () => {
  describe("Context<Resource>", () => {
    test("Context<undefined>", () => {
      expect<Context<undefined>>().type.toEqual<undefined>()
    })
    test("Context<null>", () => {
      expect<Context<null>>().type.toEqual<null>()
    })
    test("Context<boolean>", () => {
      expect<Context<boolean>>().type.toEqual<boolean>()
    })
    test("Context<string>", () => {
      expect<Context<string>>().type.toEqual<string>()
    })
    test("Context<number>", () => {
      expect<Context<number>>().type.toEqual<number>()
    })
    test("Context<symbol>", () => {
      expect<Context<symbol>>().type.toEqual<symbol>()
    })
    test("Context<View<...>>", () => {
      expect<Context<View<FlatResource>>>().type.toEqual<
        Context<FlatResource>
      >()
    })
    test("Context<View<Context<...>>>", () => {
      expect<Context<View<Context<FlatResource>>>>().type.toEqual<
        Context<FlatResource>
      >()
    })
  })

  describe("createContext()", () => {
    test("Flat context", () => {
      const context = createContext(
        FLAT_RESOURCE,
        [],
        null,
        (state, getContext) => getContext(state),
        null,
      )
      expect(context).type.toMatch<FlatContext>()
    })

    test("Nested context", () => {
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
      expect(context).type.toMatch<
        FlatContext & {nested: {context: FlatContext}}
      >()
    })
  })
})
