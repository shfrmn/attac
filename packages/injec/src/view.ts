import {AnyCapability, RecordResource, isScalar} from "#src/resource"
import {SYMBOL_CONTEXT, SYMBOL_ROOT, Context} from "#src/context"

/**
 *
 */
const SYMBOL_PREFIX: unique symbol = Symbol()

/**
 *
 */
export const SYMBOL_VIEW: unique symbol = Symbol()

/**
 *
 */
export type Inject<T> = T extends {[SYMBOL_CONTEXT]: true} ? T : Context<T>

/**
 *
 */
export class View<Resource> {
  [SYMBOL_VIEW]: boolean = true;
  [SYMBOL_PREFIX]: AnyCapability[]

  constructor(prefix: AnyCapability[]) {
    this[SYMBOL_PREFIX] = prefix
  }
}

/**
 *
 */
export function injectView<
  const Resource extends RecordResource,
>(): View<Resource> {
  return new View([])
}

/**
 *
 */
export function resolveView(
  context: Context<RecordResource>,
  view: View<RecordResource>,
): Context<RecordResource> {
  let nextContext = context[SYMBOL_ROOT]
  for (const capability of view[SYMBOL_PREFIX]) {
    nextContext = nextContext[capability]
    if (isScalar(nextContext)) {
      throw new Error(`Cannot resolve view`)
    }
  }
  return nextContext
}
