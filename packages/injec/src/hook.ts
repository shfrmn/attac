import type {AnyResource, AnyCapability} from "#src/resource"
import type {Context} from "#src/context"

/**
 *
 */
export type Hook<State> = (
  state: State,
  getContext: (state: State) => Context<AnyResource>,
  path: AnyCapability[],
) => Context<AnyResource> | null
