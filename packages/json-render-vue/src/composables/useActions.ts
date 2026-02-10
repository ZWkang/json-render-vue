import type { InjectionKey, Ref } from 'vue'
import { ref } from 'vue'
import { injectLocal, provideLocal } from '@vueuse/core'
import { useDataContext } from './useData'

// ============================================================================
// Types
// ============================================================================

export interface ActionConfirm {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
}

export interface ActionBinding {
  action: string
  params?: Record<string, unknown>
  confirm?: ActionConfirm
  onSuccess?: ActionOnSuccess
  onError?: ActionOnError
}

export interface ActionOnSuccess {
  action?: string
  navigate?: string
  setState?: Record<string, unknown>
}

export interface ActionOnError {
  action?: string
  setState?: Record<string, unknown>
}

export type ActionHandler = (params: Record<string, unknown>) => Promise<unknown> | unknown

export interface PendingConfirmation {
  action: ActionBinding
  resolve: () => void
  reject: () => void
}

export interface ActionsContext {
  pendingConfirmation: Ref<PendingConfirmation | null>
  loadingActions: Ref<Set<string>>
  handlers: Ref<Record<string, ActionHandler>>
  execute: (action: ActionBinding | string) => Promise<void>
  confirm: () => void
  cancel: () => void
  registerHandler: (name: string, handler: ActionHandler) => void
}

export interface ProvideActionsConfig {
  handlers?: Record<string, ActionHandler>
  navigate?: (path: string) => void
  onAction?: (action: ActionBinding) => Promise<void> | void
}

const ACTIONS_KEY: InjectionKey<ActionsContext> = Symbol('@json-render/actions')

// ============================================================================
// Unique ID Generator
// ============================================================================

let idCounter = 0
function generateUniqueId(): string {
  idCounter += 1
  return `${Date.now()}-${idCounter}`
}

// ============================================================================
// Deep Resolve Dynamic Values
// ============================================================================

/**
 * Recursively resolve dynamic value references within an object.
 *
 * Supported tokens:
 * - `{ path: "/statePath" }` - read a value from state
 * - `"$id"` (string) or `{ "$id": true }` - generate a unique ID
 */
function deepResolveValue(
  value: unknown,
  get: (path: string) => unknown,
): unknown {
  if (value === null || value === undefined) return value

  // "$id" string token -> generate unique ID
  if (value === '$id') {
    return generateUniqueId()
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj)

    // { path: "/foo" } -> read from state (single-key object with "path")
    if (keys.length === 1 && typeof obj.path === 'string') {
      return get(obj.path)
    }

    // { "$id": true } -> generate unique ID (single-key object)
    if (keys.length === 1 && '$id' in obj) {
      return generateUniqueId()
    }
  }

  // Recurse into arrays
  if (Array.isArray(value)) {
    return value.map(item => deepResolveValue(item, get))
  }

  // Recurse into plain objects
  if (typeof value === 'object') {
    const resolved: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      resolved[key] = deepResolveValue(val, get)
    }
    return resolved
  }

  return value
}

// ============================================================================
// Provider
// ============================================================================

export function provideActions(config?: ProvideActionsConfig): ActionsContext {
  const pendingConfirmation = ref<PendingConfirmation | null>(null)
  const loadingActions = ref<Set<string>>(new Set())
  const handlers = ref<Record<string, ActionHandler>>(config?.handlers ?? {})

  // Try to get data context immediately at initialization time
  let dataCtx: ReturnType<typeof useDataContext> | null = null
  try {
    dataCtx = useDataContext()
  }
  catch {
    // Data context not available - built-in actions won't work
  }

  const setLoading = (key: string, isLoading: boolean) => {
    const next = new Set(loadingActions.value)
    if (isLoading)
      next.add(key)
    else
      next.delete(key)
    loadingActions.value = next
  }

  const registerHandler = (name: string, handler: ActionHandler) => {
    handlers.value = { ...handlers.value, [name]: handler }
  }

  const executeNow = async (binding: ActionBinding) => {
    const actionName = binding.action
    const params = binding.params ?? {}

    // ========== Built-in Actions ==========

    // setState: Set a value at a path
    if (actionName === 'setState' && dataCtx) {
      const path = params.path as string
      const value = params.value
      if (path) {
        dataCtx.set(path, value)
      }
      return
    }

    // pushState: Append an item to an array
    if (actionName === 'pushState' && dataCtx) {
      const path = params.path as string
      const rawValue = params.value
      if (path) {
        const resolvedValue = deepResolveValue(rawValue, dataCtx.get)
        const arr = (dataCtx.get(path) as unknown[] | undefined) ?? []
        dataCtx.set(path, [...arr, resolvedValue])

        // Optionally clear a path after pushing
        const clearPath = params.clearPath as string | undefined
        if (clearPath) {
          dataCtx.set(clearPath, '')
        }
      }
      return
    }

    // removeState: Remove an item from an array by index
    if (actionName === 'removeState' && dataCtx) {
      const path = params.path as string
      const index = params.index as number
      if (path !== undefined && index !== undefined) {
        const arr = (dataCtx.get(path) as unknown[] | undefined) ?? []
        dataCtx.set(path, arr.filter((_, i) => i !== index))
      }
      return
    }

    // push: Navigate to a new screen (stack-based navigation)
    if (actionName === 'push' && dataCtx) {
      const screen = params.screen as string
      if (screen) {
        const currentScreen = dataCtx.get('/currentScreen') as string | undefined
        const navStack = (dataCtx.get('/navStack') as string[] | undefined) ?? []
        if (currentScreen) {
          dataCtx.set('/navStack', [...navStack, currentScreen])
        } else {
          dataCtx.set('/navStack', [...navStack, ''])
        }
        dataCtx.set('/currentScreen', screen)
      }
      return
    }

    // pop: Navigate back to previous screen
    if (actionName === 'pop' && dataCtx) {
      const navStack = (dataCtx.get('/navStack') as string[] | undefined) ?? []
      if (navStack.length > 0) {
        const previousScreen = navStack[navStack.length - 1]
        dataCtx.set('/navStack', navStack.slice(0, -1))
        if (previousScreen) {
          dataCtx.set('/currentScreen', previousScreen)
        } else {
          dataCtx.set('/currentScreen', undefined)
        }
      }
      return
    }

    // ========== Custom Handlers ==========

    const handler = handlers.value[actionName]
    if (handler) {
      setLoading(actionName, true)
      try {
        await handler(params)

        // Handle onSuccess
        if (binding.onSuccess) {
          if (binding.onSuccess.setState && dataCtx) {
            dataCtx.update(binding.onSuccess.setState)
          }
          if (binding.onSuccess.navigate && config?.navigate) {
            config.navigate(binding.onSuccess.navigate)
          }
          if (binding.onSuccess.action) {
            await executeNow({ action: binding.onSuccess.action })
          }
        }
      } catch (error) {
        // Handle onError
        if (binding.onError) {
          if (binding.onError.setState && dataCtx) {
            dataCtx.update(binding.onError.setState)
          }
          if (binding.onError.action) {
            await executeNow({ action: binding.onError.action })
          }
        }
        throw error
      } finally {
        setLoading(actionName, false)
      }
      return
    }

    // Fallback to onAction callback
    if (config?.onAction) {
      setLoading(actionName, true)
      try {
        await config.onAction(binding)
      } finally {
        setLoading(actionName, false)
      }
      return
    }

    console.warn(`No handler registered for action: ${actionName}`)
  }

  const execute = async (actionOrBinding: ActionBinding | string) => {
    const binding: ActionBinding = typeof actionOrBinding === 'string'
      ? { action: actionOrBinding }
      : actionOrBinding

    // Check if confirmation is required
    if (binding.confirm) {
      return new Promise<void>((resolve, reject) => {
        pendingConfirmation.value = {
          action: binding,
          resolve: async () => {
            pendingConfirmation.value = null
            try {
              await executeNow(binding)
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          reject: () => {
            pendingConfirmation.value = null
            reject(new Error('Action cancelled'))
          },
        }
      })
    }

    await executeNow(binding)
  }

  const confirm = () => {
    pendingConfirmation.value?.resolve()
  }

  const cancel = () => {
    pendingConfirmation.value?.reject()
  }

  const ctx: ActionsContext = {
    pendingConfirmation,
    loadingActions,
    handlers,
    execute,
    confirm,
    cancel,
    registerHandler,
  }

  provideLocal(ACTIONS_KEY, ctx)
  return ctx
}

// ============================================================================
// Consumer Hooks
// ============================================================================

export function useActions(): ActionsContext {
  const ctx = injectLocal(ACTIONS_KEY, null)
  if (!ctx) {
    throw new Error(
      'useActions() was called but no actions context was provided. Did you forget to call provideActions() higher in the component tree?',
    )
  }
  return ctx
}

export function useAction(binding: ActionBinding): {
  execute: () => Promise<void>
  isLoading: Ref<boolean>
} {
  const { execute } = useActions()

  const isLoading = ref(false)

  // Create a computed-like reactive check
  const executeAction = async () => {
    isLoading.value = true
    try {
      await execute(binding)
    } finally {
      isLoading.value = false
    }
  }

  return { execute: executeAction, isLoading }
}

// Re-export Action type for backwards compatibility
export type Action = ActionBinding
