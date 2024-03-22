import {injectView, RecordResource} from "@attac/injec"
import {protec, SecureContext, CapabilityConfig} from "#src/protec"

/**
 *
 */
type LogIn<Config, Resource> = <const Role extends keyof Config>(
  role: Role,
) => SecureContext<Role, Resource, Config[Role]>

/**
 *
 */
export type InferCapabilityConfig<T> =
  T extends Record<string, infer CapabilityConfig>
    ? CapabilityConfig
    : T extends LogIn<any, infer Resource>
      ? Resource
      : never

/**
 *
 */
export function rbac<
  const Resource extends RecordResource,
  Config extends Record<string, CapabilityConfig<Resource>>,
  Roles extends keyof Config,
>(resource: Resource, capabilities: Config): LogIn<Config, Resource> {
  const extendedResource = {} as {[Role in Roles]: Resource}
  for (const role in capabilities) {
    extendedResource[role as unknown as Roles] = resource
  }
  const context = protec(extendedResource, capabilities)
  return <Role extends keyof Config>(role: Role) => {
    return context[role as keyof typeof context] as SecureContext<
      Role,
      Resource,
      Config[Role]
    >
  }
}

/**
 *
 */
export function injectRbac<
  T extends RecordResource,
>(): InferCapabilityConfig<T> {
  return injectView<T>() as any
}
