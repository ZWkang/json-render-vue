import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { computed, inject, provide, ref } from 'vue'

import { useData } from './useData'

export type Validator = (value: any) => string | null

export interface ValidationContext {
  errors: Ref<Record<string, string | null>>
  register: (path: string, validator: Validator) => () => void
  validateAll: () => boolean
  clearErrors: () => void
  useValidationError: (path: string) => ComputedRef<string | null>
}

const VALIDATION_KEY: InjectionKey<ValidationContext> = Symbol('@json-render/validation')

type PathSegment = string | number

function parsePath(path: string): PathSegment[] {
  const segments: PathSegment[] = []
  let cur = ''
  let i = 0

  const pushCur = () => {
    if (cur.length > 0) {
      segments.push(cur)
      cur = ''
    }
  }

  while (i < path.length) {
    const ch = path[i]

    if (ch === '.') {
      pushCur()
      i += 1
      continue
    }

    if (ch === '[') {
      pushCur()
      i += 1

      while (i < path.length && path[i] === ' ')
        i += 1

      const quote = path[i]
      if (quote === '"' || quote === '\'') {
        i += 1
        let s = ''
        while (i < path.length) {
          const c = path[i]
          if (c === '\\') {
            if (i + 1 < path.length) {
              s += path[i + 1]
              i += 2
              continue
            }
          }
          if (c === quote) {
            i += 1
            break
          }
          s += c
          i += 1
        }

        while (i < path.length && path[i] === ' ')
          i += 1
        if (path[i] === ']')
          i += 1

        segments.push(s)
        continue
      }

      let inner = ''
      while (i < path.length && path[i] !== ']') {
        inner += path[i]
        i += 1
      }
      if (path[i] === ']')
        i += 1

      inner = inner.trim()
      if (inner.length === 0)
        continue

      if (/^-?\d+$/.test(inner))
        segments.push(Number(inner))
      else
        segments.push(inner)

      continue
    }

    cur += ch
    i += 1
  }

  pushCur()
  return segments
}

function getAt(root: any, path: string): any {
  if (!path)
    return root
  const segments = parsePath(path)
  let cur: any = root
  for (const seg of segments) {
    if (cur == null)
      return undefined
    cur = cur[seg as any]
  }
  return cur
}

export function provideValidation(): ValidationContext {
  const errors = ref<Record<string, string | null>>({})
  const validators = new Map<string, Validator>()

  const register = (path: string, validator: Validator) => {
    validators.set(path, validator)
    return () => {
      // Only remove if the exact same validator is still registered.
      if (validators.get(path) === validator)
        validators.delete(path)
    }
  }

  const validateAll = () => {
    const data = useData()
    const root = data.value

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
      if (result)
        valid = false
    }

    errors.value = nextErrors
    return valid
  }

  const clearErrors = () => {
    errors.value = {}
  }

  const useValidationError = (path: string) => {
    return computed(() => errors.value[path] ?? null)
  }

  const ctx: ValidationContext = {
    errors,
    register,
    validateAll,
    clearErrors,
    useValidationError,
  }

  provide(VALIDATION_KEY, ctx)
  return ctx
}

export function useValidation(): ValidationContext {
  const ctx = inject(VALIDATION_KEY, null)
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
