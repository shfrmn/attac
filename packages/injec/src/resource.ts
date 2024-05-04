import type {View} from "#src/view"

/**
 *
 */
export type AnyCapability = string | symbol

/**
 *
 */
export type ScalarResource =
  | undefined
  | null
  | boolean
  | number
  | string
  | symbol

/**
 *
 */
export type RecordResource = Record<AnyCapability, any>

/**
 *
 */
export type FunctionResource = (...args: any[]) => AnyResource

/**
 *
 */
export type AnyResource =
  | ScalarResource
  | RecordResource
  | FunctionResource
  | View<RecordResource>

/**
 *
 */
const SCALAR_TYPES = new Set([
  "undefined",
  "boolean",
  "string",
  "number",
  "symbol",
])

/**
 *
 */
export function isScalar(resource?: AnyResource): resource is ScalarResource {
  return SCALAR_TYPES.has(typeof resource)
}

/**
 *
 */
export function isFunction(
  resource: AnyResource,
): resource is FunctionResource {
  return typeof resource === "function"
}

/**
 *
 */
const trustedIterators = new Set([
  new Set().entries().constructor,
  new Map().entries().constructor,
])

/**
 * This function is used to determine exceptions when method
 * should be bound to a real `this` value (instead of context)
 */
export function isTrustedThis(value: any): boolean {
  return (
    value instanceof Date ||
    value instanceof Set ||
    value instanceof Map ||
    trustedIterators.has(value.constructor)
  )
}
