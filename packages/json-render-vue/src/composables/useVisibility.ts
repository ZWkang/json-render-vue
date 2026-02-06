import { computed, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'

import { useData } from './useData'

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
  value?: any
  operator?: unknown
}

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
  // Get data store reference at setup time, not inside computed
  const dataStore = useData()

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
    const current = getAt(dataStore.value, path)
    return evalCondition(operator, current, c.value)
  })
}
