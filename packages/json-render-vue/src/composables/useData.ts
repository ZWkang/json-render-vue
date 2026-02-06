import type { ComputedRef, InjectionKey, Ref, WritableComputedRef } from 'vue'
import { computed, inject, provide, ref } from 'vue'

export type JsonRenderData = Record<string, any>
export type JsonRenderDataStore = Ref<JsonRenderData>

const DATA_KEY: InjectionKey<JsonRenderDataStore> = Symbol('@json-render/data')

export function provideData(initialData: JsonRenderData): JsonRenderDataStore {
  const state = ref<JsonRenderData>(initialData ?? {})
  provide(DATA_KEY, state)
  return state
}

export function useData(): JsonRenderDataStore {
  const state = inject(DATA_KEY, null)
  if (!state) {
    throw new Error(
      'useData() was called but no data store was provided. Did you forget to call provideData() higher in the component tree?',
    )
  }
  return state
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
  const segments = parsePath(path)
  let cur: any = root
  for (const seg of segments) {
    if (cur == null)
      return undefined
    cur = cur[seg as any]
  }
  return cur
}

function setAt(root: any, path: string, value: any): void {
  const segments = parsePath(path)
  if (segments.length === 0)
    return

  let cur: any = root
  for (let idx = 0; idx < segments.length - 1; idx += 1) {
    const key = segments[idx]
    const next = segments[idx + 1]
    let nextVal = cur[key as any]

    if (nextVal == null || typeof nextVal !== 'object') {
      nextVal = typeof next === 'number' ? [] : {}
      cur[key as any] = nextVal
    }

    cur = nextVal
  }

  cur[segments[segments.length - 1] as any] = value
}

export function useDataValue<T = any>(path: string): ComputedRef<T> {
  const data = useData()
  return computed(() => getAt(data.value, path) as T)
}

/**
 * Returns a writable computed ref bound to a path in the data store.
 * Supports v-model directly: `v-model="binding"`
 */
export function useDataBinding<T = any>(path: string): WritableComputedRef<T> {
  const data = useData()

  return computed<T>({
    get: () => getAt(data.value, path) as T,
    set: (newValue: T) => {
      if (!path) {
        data.value = newValue as any
        return
      }
      setAt(data.value, path, newValue)
    },
  })
}
