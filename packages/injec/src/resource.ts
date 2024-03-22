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
