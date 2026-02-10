/**
 * Path utilities for accessing nested object properties
 * Supports dot notation and bracket access: user.name, items[0].id, data["key"]
 */

export type PathSegment = string | number

/**
 * Parse a path string into segments
 * Examples:
 *   "user.name" → ["user", "name"]
 *   "items[0].id" → ["items", 0, "id"]
 *   "data['key']" → ["data", "key"]
 */
export function parsePath(path: string): PathSegment[] {
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

      // Skip whitespace
      while (i < path.length && path[i] === ' ')
        i += 1

      const quote = path[i]
      if (quote === '"' || quote === '\'') {
        // Quoted string key
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

        // Skip whitespace and closing bracket
        while (i < path.length && path[i] === ' ')
          i += 1
        if (path[i] === ']')
          i += 1

        segments.push(s)
        continue
      }

      // Numeric index or unquoted key
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

/**
 * Get a value at a path from an object
 */
export function getAt(root: unknown, path: string): unknown {
  if (!path)
    return root

  const segments = parsePath(path)
  let cur: unknown = root

  for (const seg of segments) {
    if (cur == null)
      return undefined
    cur = (cur as Record<string | number, unknown>)[seg]
  }

  return cur
}

/**
 * Set a value at a path in an object (mutates the object)
 */
export function setAt(root: unknown, path: string, value: unknown): void {
  const segments = parsePath(path)
  if (segments.length === 0)
    return

  let cur: unknown = root

  for (let idx = 0; idx < segments.length - 1; idx += 1) {
    const key = segments[idx]
    const next = segments[idx + 1]
    let nextVal = (cur as Record<string | number, unknown>)[key]

    if (nextVal == null || typeof nextVal !== 'object') {
      nextVal = typeof next === 'number' ? [] : {}
      ;(cur as Record<string | number, unknown>)[key] = nextVal
    }

    cur = nextVal
  }

  ;(cur as Record<string | number, unknown>)[segments[segments.length - 1]] = value
}

/**
 * Remove a value at a path from an object (mutates the object)
 */
export function removeAt(root: unknown, path: string): void {
  const segments = parsePath(path)
  if (segments.length === 0)
    return

  let cur: unknown = root

  for (let idx = 0; idx < segments.length - 1; idx += 1) {
    const key = segments[idx]
    cur = (cur as Record<string | number, unknown>)?.[key]
    if (cur == null)
      return
  }

  const lastKey = segments[segments.length - 1]
  if (Array.isArray(cur) && typeof lastKey === 'number') {
    cur.splice(lastKey, 1)
  }
  else if (cur && typeof cur === 'object') {
    delete (cur as Record<string | number, unknown>)[lastKey]
  }
}
