import type { ShallowRef } from 'vue'
import { shallowRef } from 'vue'

import type { Spec } from '../types/catalog-types'

export interface UIStreamState {
  spec: ShallowRef<Spec | null>
  update: (patchOrSpec: any) => void
  abort: () => void
}

export function useUIStream(initialSpec: Spec | null): UIStreamState {
  const spec = shallowRef<Spec | null>(initialSpec)
  const controller = shallowRef<AbortController>(new AbortController())

  const abort = () => {
    controller.value.abort()
    controller.value = new AbortController()
  }

  const update = (patchOrSpec: any) => {
    // Simplified parity with the React version:
    // - If we receive a full Spec tree, replace.
    // - If we receive a partial object patch, shallow-merge at the root.
    // For more complex streaming diffs (e.g. JSON Patch), consider adding a patch lib.
    if (patchOrSpec == null) {
      spec.value = null
      return
    }

    if (typeof patchOrSpec === 'object' && !Array.isArray(patchOrSpec)) {
      const maybeType = (patchOrSpec as any).type
      if (typeof maybeType === 'string' && maybeType.length > 0) {
        spec.value = patchOrSpec as Spec
        return
      }

      if (spec.value && typeof spec.value === 'object' && !Array.isArray(spec.value)) {
        spec.value = { ...(spec.value as any), ...(patchOrSpec as any) } as Spec
        return
      }
    }

    spec.value = patchOrSpec as Spec
  }

  return { spec, update, abort }
}
