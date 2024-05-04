import {
  AnyCapability,
  AnyResource,
  ScalarResource,
  RecordResource,
  isScalar,
  isFunction,
  isTrustedThis,
} from "#src/resource"
import {Inject, View, resolveView} from "#src/view"
import {Hook} from "#src/hook"

/**
 *
 */
export const SYMBOL_ROOT: unique symbol = Symbol()

/**
 *
 */
export const SYMBOL_CONTEXT: unique symbol = Symbol()

/**
 *
 */
export interface AnyContext {
  [SYMBOL_CONTEXT]: true
  [SYMBOL_ROOT]: Context<RecordResource>
}

/**
 *
 */
export type Context<Resource> =
  Resource extends ScalarResource ? Resource
  : Resource extends [...any] ?
    {[K in keyof Resource]: Context<Resource[K]>} // Tuples must be handled separately from arrays
  : Resource extends (infer E)[] ? Context<E>[]
  : Resource extends Promise<infer R> ? Promise<Context<R>>
  : Resource extends (...args: any[]) => infer Return ?
    (...args: Parameters<Resource>) => Context<Return>
  : Resource extends View<infer T> ? Inject<T>
  : Resource extends Record<any, any> ?
    AnyContext & {
      [Capability in keyof Resource]: Context<Resource[Capability]>
    }
  : never

/**
 *
 */
export function createContext<const Resource extends RecordResource, State>(
  resource: Resource,
  prefix: AnyCapability[],
  rootContext: Context<Resource> | null,
  hook: Hook<State>,
  state: State,
): Context<Resource> {
  const descriptors: Record<string | symbol, PropertyDescriptor> = {}
  for (const capability of Reflect.ownKeys(resource)) {
    descriptors[capability] = {
      enumerable: true,
      configurable: true,
      writable: true,
    }
  }
  // Specifying proxy target this way achieves the following goals:
  // 1. Prototype of the proxy will be the same as the original
  //    value (reason not to use `{}` as a target).
  // 2. `Object.create` preserves the prototype, while also allowing
  //    to override non-writable and non-configurable properties.
  return new Proxy(Object.create(resource, descriptors) as Context<Resource>, {
    // Third argument here is the resulting proxy
    get(_, capability, context: Context<Resource>) {
      wellKnownProps: switch (capability) {
        case SYMBOL_ROOT:
          return rootContext ?? context
        case SYMBOL_CONTEXT:
          return true
        case Symbol.iterator:
          return resource[Symbol.iterator]
        case "toJSON":
          return resource.toJSON || (() => resource)
      }
      const nextResource = resource[capability] as AnyResource
      if (isScalar(nextResource)) {
        return nextResource
      }
      if (nextResource instanceof View) {
        const nextPrefix = [...prefix, capability, SYMBOL_CONTEXT]
        return hook(
          state,
          () => resolveView(context as Context<RecordResource>, nextResource),
          nextPrefix,
        )
      }
      const nextPrefix = [...prefix, capability]
      const wrap = (
        nextResource: AnyResource,
        nextState: State,
      ): Context<AnyResource> => {
        // TODO: handle view
        if (isScalar(nextResource)) {
          return nextResource
        } else if (Array.isArray(nextResource)) {
          return nextResource.map((nextResource) => {
            return wrap(nextResource, nextState)
          }) as unknown as Context<AnyResource>
        } else if (nextResource instanceof Promise) {
          return nextResource.then((nextResource) => {
            return wrap(nextResource, nextState)
          }) as unknown as Context<AnyResource>
        } else if (isFunction(nextResource)) {
          return (...args: any[]) => {
            const returnValue = nextResource.apply(
              isTrustedThis(resource) ? resource : context,
              args,
            )
            return wrap(returnValue, nextState)
          }
        } else {
          return createContext(
            nextResource,
            nextPrefix,
            (rootContext ?? context) as Context<RecordResource>,
            hook,
            nextState,
          )
        }
      }
      const nextContext = hook(
        state,
        (nextState) => wrap(nextResource, nextState),
        nextPrefix,
      )
      return nextContext === null ? nextResource : nextContext
    },
  })
}
