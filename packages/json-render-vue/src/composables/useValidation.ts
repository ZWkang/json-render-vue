import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { computed, ref } from 'vue'
import { injectLocal, provideLocal } from '@vueuse/core'

import { getAt } from '../utils/path'
import type { JsonRenderDataStore } from './useData'

export type Validator = (value: unknown) => string | null

export interface FieldValidationState {
  touched: boolean
  validated: boolean
  result: string | null
}

export interface ValidationContext {
  errors: Ref<Record<string, string | null>>
  fieldStates: Ref<Record<string, FieldValidationState>>
  register: (path: string, validator: Validator) => () => void
  validateAll: () => boolean
  validate: (path: string) => string | null
  touch: (path: string) => void
  clearErrors: () => void
  useValidationError: (path: string) => ComputedRef<string | null>
}

const VALIDATION_KEY: InjectionKey<ValidationContext> = Symbol('@json-render/validation')

export function provideValidation(dataStore?: JsonRenderDataStore): ValidationContext {
  const errors = ref<Record<string, string | null>>({})
  const fieldStates = ref<Record<string, FieldValidationState>>({})
  const validators = new Map<string, Validator>()

  const register = (path: string, validator: Validator) => {
    validators.set(path, validator)
    // Initialize field state
    if (!fieldStates.value[path]) {
      fieldStates.value = {
        ...fieldStates.value,
        [path]: { touched: false, validated: false, result: null },
      }
    }
    return () => {
      if (validators.get(path) === validator)
        validators.delete(path)
    }
  }

  const validate = (path: string): string | null => {
    const root = dataStore?.value ?? {}
    const validator = validators.get(path)
    if (!validator)
      return null

    let result: string | null = null
    try {
      result = validator(getAt(root, path))
    }
    catch (err) {
      result = err instanceof Error ? err.message : String(err)
    }

    errors.value = { ...errors.value, [path]: result }
    fieldStates.value = {
      ...fieldStates.value,
      [path]: {
        touched: fieldStates.value[path]?.touched ?? true,
        validated: true,
        result,
      },
    }

    return result
  }

  const touch = (path: string) => {
    fieldStates.value = {
      ...fieldStates.value,
      [path]: {
        ...fieldStates.value[path],
        touched: true,
        validated: fieldStates.value[path]?.validated ?? false,
        result: fieldStates.value[path]?.result ?? null,
      },
    }
  }

  const validateAll = () => {
    const root = dataStore?.value ?? {}
    const nextErrors: Record<string, string | null> = {}
    let valid = true

    for (const [path, validator] of validators.entries()) {
      let result: string | null = null
      try {
        result = validator(getAt(root, path))
      }
      catch (err) {
        result = err instanceof Error ? err.message : String(err)
      }

      nextErrors[path] = result
      fieldStates.value = {
        ...fieldStates.value,
        [path]: { touched: true, validated: true, result },
      }
      if (result)
        valid = false
    }

    errors.value = nextErrors
    return valid
  }

  const clearErrors = () => {
    errors.value = {}
    const clearedStates: Record<string, FieldValidationState> = {}
    for (const path of Object.keys(fieldStates.value)) {
      clearedStates[path] = { touched: false, validated: false, result: null }
    }
    fieldStates.value = clearedStates
  }

  const useValidationError = (path: string) => {
    return computed(() => errors.value[path] ?? null)
  }

  const ctx: ValidationContext = {
    errors,
    fieldStates,
    register,
    validateAll,
    validate,
    touch,
    clearErrors,
    useValidationError,
  }

  provideLocal(VALIDATION_KEY, ctx)
  return ctx
}

export function useValidation(): ValidationContext {
  const ctx = injectLocal(VALIDATION_KEY, null)
  if (!ctx) {
    throw new Error(
      'useValidation() was called but no validation context was provided. Did you forget to call provideValidation() higher in the component tree?',
    )
  }
  return ctx
}

export function useValidationError(path: string): ComputedRef<string | null> {
  const ctx = useValidation()
  return computed(() => ctx.errors.value[path] ?? null)
}

export function useFieldValidation(path: string, validator?: Validator): {
  state: ComputedRef<FieldValidationState>
  validate: () => string | null
  touch: () => void
  clear: () => void
  error: ComputedRef<string | null>
  isValid: ComputedRef<boolean>
} {
  const ctx = useValidation()

  // Register validator if provided
  if (validator) {
    ctx.register(path, validator)
  }

  const state = computed(() => ctx.fieldStates.value[path] ?? {
    touched: false,
    validated: false,
    result: null,
  })

  const validate = () => ctx.validate(path)
  const touch = () => ctx.touch(path)
  const clear = () => {
    ctx.errors.value = { ...ctx.errors.value, [path]: null }
    ctx.fieldStates.value = {
      ...ctx.fieldStates.value,
      [path]: { touched: false, validated: false, result: null },
    }
  }

  const error = computed(() => ctx.errors.value[path] ?? null)
  const isValid = computed(() => !ctx.errors.value[path])

  return { state, validate, touch, clear, error, isValid }
}
