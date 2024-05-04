import {
  RecordResource,
  createContext,
  View,
  Inject,
  SYMBOL_CONTEXT,
} from "@attac/injec"
import {AccessError} from "./error"

/**
 *
 */
declare class Phantom<T> {}

/**
 *
 */
export type CapabilityConfig<T> =
  | ({
      [K in keyof T]?:
        | boolean
        | CapabilityConfig<
            T[K] extends (...args: any[]) => any ? ReturnType<T[K]> : T[K]
          >
    } & {
      all?: boolean
    })
  | boolean

/**
 *
 */
export type SecureCapability<Brand, Resource> = Phantom<Brand> &
  (Resource extends View<infer T>
    ? SecureCapability<Brand, Inject<T>>
    : Resource extends (...args: infer Args) => infer R
      ? (...args: Args) => SecureCapability<Brand, R>
      : Resource extends Record<any, any>
        ? {
            [Capability in keyof Resource]: SecureCapability<
              Brand,
              Resource[Capability]
            >
          }
        : Resource)

/**
 *
 */
export type SecureContext<Roles, Resource, Config> = {
  [Capability in keyof Config]: Capability extends keyof Resource
    ? Resource[Capability] extends (...args: infer Args) => infer Return
      ? (...args: Args) => SecureCapability<Roles, Return>
      : SecureCapability<Roles, Resource[Capability]>
    : never
}

/**
 *
 */
export function protec<
  const Resource extends RecordResource,
  Config extends CapabilityConfig<Resource>,
>(
  resource: Resource,
  capabilities: Config,
): SecureContext<unknown, Resource, Config> {
  return createContext(
    resource,
    [],
    null,
    (state, getContext, path) => {
      const prop = path[path.length - 1]!
      let nextContext
      if (state === true) {
        nextContext = getContext(true)
      } else if (
        typeof state === "object" &&
        (state[prop] || (state.all && state[prop] !== false))
      ) {
        nextContext = getContext(state[prop] ?? true)
      }
      if (typeof nextContext === "undefined") {
        const pathString = path.map((prop) => prop.toString()).join("/")
        throw new AccessError(`Unauthorized access: ${pathString}`, {
          props: {path},
        })
      }
      if (path[path.length - 1] === SYMBOL_CONTEXT) {
        return (nextContext as RecordResource)[path[0]!]
      } else {
        return nextContext
      }
    },
    capabilities as CapabilityConfig<Resource>,
  ) as SecureContext<unknown, Resource, Config>
}
