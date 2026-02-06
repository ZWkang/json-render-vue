import { computed, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'

import { useDataValue } from './useData'

type VisibilityOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'contains'

type VisibilityCondition = {
  path?: unknown
  value?: any
  operator?: unknown
}

function opIn(current: any, expected: any): boolean {
  if (Array.isArray(expected))
    return expected.includes(current)
  if (expected instanceof Set)
    return expected.has(current)
  if (typeof expected === 'string')
    return expected.includes(String(current))
  if (expected != null && typeof expected === 'object')
    return Object.prototype.hasOwnProperty.call(expected, current as any)
  return false
}

function opContains(current: any, expected: any): boolean {
  if (Array.isArray(current))
    return current.includes(expected)
  if (current instanceof Set)
    return current.has(expected)
  if (typeof current === 'string')
    return current.includes(String(expected))
  if (current != null && typeof current === 'object')
    return Object.prototype.hasOwnProperty.call(current, expected as any)
  return false
}

function evalCondition(operator: VisibilityOperator, current: any, expected: any): boolean {
  switch (operator) {
    case 'eq':
      return Object.is(current, expected)
    case 'neq':
      return !Object.is(current, expected)
    case 'gt':
      return (current as any) > (expected as any)
    case 'gte':
      return (current as any) >= (expected as any)
    case 'lt':
      return (current as any) < (expected as any)
    case 'lte':
      return (current as any) <= (expected as any)
    case 'in':
      return opIn(current, expected)
    case 'contains':
      return opContains(current, expected)
    default:
      return Object.is(current, expected)
  }
}

export function useIsVisible(
  condition: MaybeRefOrGetter<boolean | Record<string, any> | undefined>,
): ComputedRef<boolean> {
  return computed(() => {
    const resolved = toValue(condition) as any

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

    const operator = (c.operator ?? 'eq') as VisibilityOperator
    const current = useDataValue<any>(path).value
    return evalCondition(operator, current, c.value)
  })
}
