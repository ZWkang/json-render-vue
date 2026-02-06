import type { InjectionKey, Ref } from 'vue'
import { inject, provide, ref } from 'vue'
import type { Action } from '../types/catalog-types'

export interface ActionsContext {
  pendingConfirmation: Ref<Action | null>
  loadingActions: Ref<Set<string>>
  execute: (action: Action) => Promise<void>
  confirm: () => Promise<void>
  cancel: () => void
}

export interface ProvideActionsConfig {
  onAction?: (action: Action) => Promise<void> | void
}

const ACTIONS_KEY: InjectionKey<ActionsContext> = Symbol('@json-render/actions')

function getActionKey(action: Action): string | null {
  const anyAction = action as any
  if (typeof anyAction?.id === 'string' && anyAction.id.length > 0)
    return anyAction.id
  if (typeof action.type === 'string' && action.type.length > 0)
    return action.type
  return null
}

export function provideActions(config?: ProvideActionsConfig): ActionsContext {
  const pendingConfirmation = ref<Action | null>(null)
  const loadingActions = ref<Set<string>>(new Set())

  const setLoading = (key: string, isLoading: boolean) => {
    // Replace the Set to make updates reliably observable.
    const next = new Set(loadingActions.value)
    if (isLoading)
      next.add(key)
    else
      next.delete(key)
    loadingActions.value = next
  }

  const executeNow = async (action: Action) => {
    const key = getActionKey(action)
    if (key)
      setLoading(key, true)
    try {
      await config?.onAction?.(action)
    }
    finally {
      if (key)
        setLoading(key, false)
    }
  }

  const execute = async (action: Action) => {
    const confirm = (action as any)?.confirm as unknown
    if (confirm === true || (typeof confirm === 'string' && confirm.length > 0)) {
      pendingConfirmation.value = action
      return
    }
    await executeNow(action)
  }

  const confirmAction = async () => {
    const action = pendingConfirmation.value
    if (!action)
      return

    try {
      // Ignore the confirm check for the pending action.
      await executeNow(action)
    }
    finally {
      pendingConfirmation.value = null
    }
  }

  const cancel = () => {
    pendingConfirmation.value = null
  }

  const ctx: ActionsContext = {
    pendingConfirmation,
    loadingActions,
    execute,
    confirm: confirmAction,
    cancel,
  }

  provide(ACTIONS_KEY, ctx)
  return ctx
}

export function useActions(): ActionsContext {
  const ctx = inject(ACTIONS_KEY, null)
  if (!ctx) {
    throw new Error(
      'useActions() was called but no actions context was provided. Did you forget to call provideActions() higher in the component tree?',
    )
  }
  return ctx
}
