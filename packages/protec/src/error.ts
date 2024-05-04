import ModernError from "modern-errors"

export const AccessError = ModernError.subclass("AccessError", {
  props: {} as {
    path: string[]
  },
})
