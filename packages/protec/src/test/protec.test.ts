import {test} from "node:test"
import assert from "node:assert/strict"
import {rbac, injectRbac} from "#src/rbac"

class Singleton {
  nested = ""
}
class AccountService {
  services = injectRbac<typeof logIn>()
  getAccount() {
    this.services.Post().listPosts()
  }
  deleteAccount() {}
}
class PostService {
  listPosts() {}
}

const Services = {
  Singleton: new Singleton(),
  Post: () => new PostService(),
  Account: () => new AccountService(),
}

const logIn = rbac(Services, {
  admin: {
    Singleton: true,
    Account: {getAccount: true, deleteAccount: true},
    Post: true,
  },
  user: {
    Singleton: false,
    Account: {getAccount: true, deleteComment: false},
    Post: false,
  },
})

test("Permissions", async (t) => {
  await t.test("Option: true", async (t) => {
    const context = logIn("admin")

    await t.test("Singleton", () => {
      assert.doesNotThrow(
        () => context.Singleton,
        "allows access to related capability",
      )
      assert.doesNotThrow(
        () => context.Singleton.nested,
        "allows access to nested capabilities",
      )
    })

    await t.test("Getter", () => {
      assert.doesNotThrow(
        () => context.Post(),
        "allows access to related capability",
      )
      assert.doesNotThrow(
        () => context.Post().listPosts(),
        "allows access to nested capabilities",
      )
    })
  })

  await t.test("Option: false", async (t) => {
    const context = logIn("user")

    await t.test("Singleton", () => {
      assert.throws(
        () => context.Singleton,
        "prohibits access to related capability",
      )
      assert.throws(
        () => context.Singleton.nested,
        "prohibits access to nested capabilities",
      )
    })

    await t.test("Getter", () => {
      assert.throws(
        () => context.Post(),
        "prohibits access to related capability",
      )
      assert.throws(
        () => context.Post().listPosts(),
        "prohibits access to nested capabilities",
      )
    })
  })
})
