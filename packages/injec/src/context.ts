import {
  AnyCapability,
  AnyResource,
  ScalarResource,
  RecordResource,
  isScalar,
  isFunction,
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
export type Context<Resource> = Resource extends ScalarResource
  ? Resource
  : Resource extends (...args: infer Args) => infer Return
    ? (...args: Args) => Context<Return>
    : Resource extends View<infer T>
      ? Inject<T>
      : Resource extends Record<any, any>
        ? AnyContext & {
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
  return new Proxy(resource as Context<Resource>, {
    get(_, capability, context: Context<Resource>) {
      wellKnownProps: switch (capability) {
        case SYMBOL_ROOT:
          return rootContext ?? context
        case SYMBOL_CONTEXT:
          return true
      }
      const nextResource = resource[capability] as AnyResource
      if (isScalar(nextResource)) {
        return nextResource
      }
      if (nextResource instanceof View) {
        const nextPrefix = [...prefix, capability, SYMBOL_CONTEXT]
        return hook(state, () => resolveView(context, nextResource), nextPrefix)
      }
      const nextPrefix = [...prefix, capability]
      const getNextContext = (nextState: State) => {
        return isFunction(nextResource)
          ? (...args: any[]) => {
              const result = nextResource.call(context, args)
              return isScalar(result) // TODO: handle view & functions
                ? result
                : createContext(
                    result,
                    nextPrefix,
                    rootContext ?? context,
                    hook,
                    nextState,
                  )
            }
          : createContext(
              nextResource,
              nextPrefix,
              rootContext ?? context,
              hook,
              nextState,
            )
      }
      const nextContext = hook(state, getNextContext, nextPrefix)
      return nextContext === null ? nextResource : nextContext
    },
  })
}
