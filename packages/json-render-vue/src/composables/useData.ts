import type { ComputedRef, InjectionKey, Ref, WritableComputedRef } from 'vue'
import { computed, ref } from 'vue'
import { injectLocal, provideLocal } from '@vueuse/core'
import { getAt, setAt } from '../utils/path'

export type JsonRenderData = Record<string, unknown>
export type JsonRenderDataStore = Ref<JsonRenderData>

export interface AuthState {
  isSignedIn: boolean
  user?: Record<string, unknown>
}

export interface DataContextValue {
  state: JsonRenderDataStore
  authState: Ref<AuthState | undefined>
  get: (path: string) => unknown
  set: (path: string, value: unknown) => void
  update: (updates: Record<string, unknown>) => void
}

const DATA_KEY: InjectionKey<DataContextValue> = Symbol('@json-render/data')

export interface ProvideDataOptions {
  initialState?: JsonRenderData
  authState?: AuthState
  onStateChange?: (path: string, value: unknown) => void
}

export function provideData(options: ProvideDataOptions | JsonRenderData = {}): DataContextValue {
  // Support legacy signature: provideData(initialData)
  const opts: ProvideDataOptions = 'initialState' in options || 'authState' in options || 'onStateChange' in options
    ? options as ProvideDataOptions
    : { initialState: options as JsonRenderData }

  const state = ref<JsonRenderData>(opts.initialState ?? {})
  const authState = ref<AuthState | undefined>(opts.authState)

  const get = (path: string): unknown => getAt(state.value, path)

  const set = (path: string, value: unknown): void => {
    if (!path) {
      state.value = value as JsonRenderData
    }
    else {
      setAt(state.value, path, value)
      // Trigger reactivity by reassigning
      state.value = { ...state.value }
    }
    opts.onStateChange?.(path, value)
  }

  const update = (updates: Record<string, unknown>): void => {
    for (const [path, value] of Object.entries(updates)) {
      setAt(state.value, path, value)
      opts.onStateChange?.(path, value)
    }
    // Trigger reactivity
    state.value = { ...state.value }
  }

  const ctx: DataContextValue = {
    state,
    authState,
    get,
    set,
    update,
  }

  provideLocal(DATA_KEY, ctx)
  return ctx
}

export function useData(): JsonRenderDataStore {
  const ctx = injectLocal(DATA_KEY, null)
  if (!ctx) {
    throw new Error(
      'useData() was called but no data store was provided. Did you forget to call provideData() higher in the component tree?',
    )
  }
  return ctx.state
}

export function useDataContext(): DataContextValue {
  const ctx = injectLocal(DATA_KEY, null)
  if (!ctx) {
    throw new Error(
      'useDataContext() was called but no data store was provided. Did you forget to call provideData() higher in the component tree?',
    )
  }
  return ctx
}

export function useDataValue<T = unknown>(path: string): ComputedRef<T> {
  const ctx = useDataContext()
  return computed(() => ctx.get(path) as T)
}

/**
 * Returns a writable computed ref bound to a path in the data store.
 * Supports v-model directly: `v-model="binding"`
 */
export function useDataBinding<T = unknown>(path: string): WritableComputedRef<T> {
  const ctx = useDataContext()

  return computed<T>({
    get: () => ctx.get(path) as T,
    set: (newValue: T) => ctx.set(path, newValue),
  })
}
