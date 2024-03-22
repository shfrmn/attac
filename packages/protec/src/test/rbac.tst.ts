import {describe, test, expect} from "tstyche"
import {rbac, SecureContext, SecureCapability} from "#src/index"

const resource = {foo: "bar", sayHi: () => "hi"} as const
const config = {
  admin: {foo: true, sayHi: true},
  user: {foo: false, sayHi: true},
}
const logIn = rbac(resource, config)
type TestContext<Role extends keyof typeof config> = SecureContext<
  Role,
  typeof resource,
  (typeof config)[Role]
>

describe("Narrow role context", () => {
  const context = logIn("admin")
  test("Context type", () => {
    expect<typeof context>().type.toEqual<TestContext<"admin">>()
  })
  test("Primitive capability type", () => {
    expect<typeof context.foo>().type.toEqual<
      SecureCapability<"admin", "bar">
    >()
  })
  test("Method capability type", () => {
    expect<typeof context.sayHi>().type.toEqual<
      () => SecureCapability<"admin", string>
    >()
  })
})

describe("Broad role context", () => {
  const context = logIn("user" as "admin" | "user")
  test("Context type", () => {
    expect<typeof context>().type.toEqual<TestContext<"admin" | "user">>()
  })
  test("Primitive capability type", () => {
    expect<typeof context.foo>().type.toEqual<
      SecureCapability<"admin" | "user", "bar">
    >()
  })
  test("Method capability type", () => {
    expect<typeof context.sayHi>().type.toEqual<
      () => SecureCapability<"admin" | "user", string>
    >()
  })
})
