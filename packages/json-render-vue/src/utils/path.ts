/**
 * Path utilities for accessing nested object properties.
 *
 * Supported formats:
 * - Dot/bracket path: user.name, items[0].id, data["key"]
 * - JSON Pointer: /user/name, /items/0/id
 */

export type PathSegment = string | number

function decodePointerToken(token: string): string {
  return token.replace(/~1/g, '/').replace(/~0/g, '~')
}

function isIdentifier(token: string): boolean {
  return /^[$A-Z_][\w$]*$/i.test(token)
}

/**
 * Normalize JSON Pointer paths to dot/bracket format.
 * Non-pointer paths are returned as-is.
 */
function normalizePath(path: string): string {
  if (!path || !path.startsWith('/'))
    return path

  const tokens = path
    .split('/')
    .slice(1)
    .map(decodePointerToken)

  if (tokens.length === 0)
    return ''

  let normalized = ''
  for (const token of tokens) {
    if (/^-?\d+$/.test(token)) {
      normalized += `[${token}]`
      continue
    }

    if (isIdentifier(token)) {
      normalized += normalized ? `.${token}` : token
      continue
    }

    normalized += `[${JSON.stringify(token)}]`
  }

  return normalized
}

/**
 * Parse a path string into segments
 * Examples:
 *   "user.name" -> ["user", "name"]
 *   "items[0].id" -> ["items", 0, "id"]
 *   "data['key']" -> ["data", "key"]
 *   "/user/name" -> ["user", "name"]
 */
export function parsePath(path: string): PathSegment[] {
  const normalizedPath = normalizePath(path)
  const segments: PathSegment[] = []
  let cur = ''
  let i = 0

  const pushCur = () => {
    if (cur.length > 0) {
      segments.push(cur)
      cur = ''
    }
  }

  while (i < normalizedPath.length) {
    const ch = normalizedPath[i]

    if (ch === '.') {
      pushCur()
      i += 1
      continue
    }

    if (ch === '[') {
      pushCur()
      i += 1

      // Skip whitespace
      while (i < normalizedPath.length && normalizedPath[i] === ' ')
        i += 1

      const quote = normalizedPath[i]
      if (quote === '"' || quote === '\'') {
        // Quoted string key
        i += 1
        let s = ''
        while (i < normalizedPath.length) {
          const c = normalizedPath[i]
          if (c === '\\') {
            if (i + 1 < normalizedPath.length) {
              s += normalizedPath[i + 1]
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
        while (i < normalizedPath.length && normalizedPath[i] === ' ')
          i += 1
        if (normalizedPath[i] === ']')
          i += 1

        segments.push(s)
        continue
      }

      // Numeric index or unquoted key
      let inner = ''
      while (i < normalizedPath.length && normalizedPath[i] !== ']') {
        inner += normalizedPath[i]
        i += 1
      }
      if (normalizedPath[i] === ']')
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
