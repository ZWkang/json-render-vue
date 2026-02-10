import { computed, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'

import { getAt } from '../utils/path'
import { useDataContext } from './useData'

type VisibilityOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'contains'

interface VisibilityCondition {
  path?: unknown
  value?: unknown
  operator?: unknown
}

function opIn(current: unknown, expected: unknown): boolean {
  if (Array.isArray(expected))
    return expected.includes(current)
  if (expected instanceof Set)
    return expected.has(current)
  if (typeof expected === 'string')
    return expected.includes(String(current))
  if (expected != null && typeof expected === 'object')
    return Object.prototype.hasOwnProperty.call(expected, current as string)
  return false
}

function opContains(current: unknown, expected: unknown): boolean {
  if (Array.isArray(current))
    return current.includes(expected)
  if (current instanceof Set)
    return current.has(expected)
  if (typeof current === 'string')
    return current.includes(String(expected))
  if (current != null && typeof current === 'object')
    return Object.prototype.hasOwnProperty.call(current, expected as string)
  return false
}

function evalCondition(operator: VisibilityOperator, current: unknown, expected: unknown): boolean {
  switch (operator) {
    case 'eq':
      return Object.is(current, expected)
    case 'neq':
      return !Object.is(current, expected)
    case 'gt':
      return (current as number) > (expected as number)
    case 'gte':
      return (current as number) >= (expected as number)
    case 'lt':
      return (current as number) < (expected as number)
    case 'lte':
      return (current as number) <= (expected as number)
    case 'in':
      return opIn(current, expected)
    case 'contains':
      return opContains(current, expected)
    default:
      return Object.is(current, expected)
  }
}

export function useIsVisible(
  condition: MaybeRefOrGetter<boolean | VisibilityCondition | Record<string, unknown> | undefined>,
): ComputedRef<boolean> {
  const ctx = useDataContext()

  return computed(() => {
    const resolved = toValue(condition) as unknown

    // null/undefined/true => visible
    if (resolved == null || resolved === true)
      return true

    if (typeof resolved === 'boolean')
      return resolved

    if (typeof resolved !== 'object')
      return true

    const c = resolved as VisibilityCondition
    const path = c.path
    if (typeof path !== 'string' || path.length === 0)
      return true

    // Check auth conditions
    if (path === '$auth.isSignedIn') {
      return ctx.authState.value?.isSignedIn === c.value
    }

    const operator = (c.operator ?? 'eq') as VisibilityOperator
    const current = getAt(ctx.state.value, path)
    return evalCondition(operator, current, c.value)
  })
}
