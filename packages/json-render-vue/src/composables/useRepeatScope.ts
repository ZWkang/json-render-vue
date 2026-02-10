import type { InjectionKey } from 'vue'
import { injectLocal, provideLocal } from '@vueuse/core'

/**
 * Repeat scope value provided to child elements inside a repeated element.
 */
export interface RepeatScopeValue {
  /** Absolute state path to the current array item (e.g. "/todos/0") */
  basePath: string
  /** Index of the current item in the array */
  index: number
}

const REPEAT_SCOPE_KEY: InjectionKey<RepeatScopeValue> = Symbol('@json-render/repeat-scope')

/**
 * Provides repeat scope to child elements so $item and $index tokens resolve correctly.
 */
export function provideRepeatScope(value: RepeatScopeValue): void {
  provideLocal(REPEAT_SCOPE_KEY, value)
}

/**
 * Read the current repeat scope (or null if not inside a repeated element).
 */
export function useRepeatScope(): RepeatScopeValue | null {
  return injectLocal(REPEAT_SCOPE_KEY, null)
}

// ---------------------------------------------------------------------------
// Token rewriting helpers
// ---------------------------------------------------------------------------

/**
 * Recursively rewrite `$item` and `$index` tokens in a value.
 *
 * - `"$item/foo"` → `"{basePath}/foo"`
 * - `"$item"` → `"{basePath}"`
 * - `"$index"` → `index` (number)
 */
export function rewriteRepeatTokens(
  value: unknown,
  basePath: string,
  index: number,
): unknown {
  if (typeof value === 'string') {
    if (value === '$index') return index
    if (value === '$item') return basePath
    if (value.startsWith('$item/'))
      return basePath + value.slice('$item'.length)
    return value
  }

  if (Array.isArray(value)) {
    let changed = false
    const result = value.map((item) => {
      const rewritten = rewriteRepeatTokens(item, basePath, index)
      if (rewritten !== item) changed = true
      return rewritten
    })
    return changed ? result : value
  }

  if (typeof value === 'object' && value !== null) {
    let changed = false
    const result: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const rewritten = rewriteRepeatTokens(val, basePath, index)
      if (rewritten !== val) changed = true
      result[key] = rewritten
    }
    return changed ? result : value
  }

  return value
}
