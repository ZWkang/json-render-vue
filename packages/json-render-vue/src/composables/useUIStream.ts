import { getCurrentInstance, onUnmounted, ref, shallowRef } from 'vue'
import type { Ref, ShallowRef } from 'vue'

import type { FlatElement, JsonPatch, Spec, TokenUsage, UIElement } from '../types/catalog-types'
import { getAt, removeAt, setAt } from '../utils/path'

// ============================================================================
// Types
// ============================================================================

export interface UseUIStreamOptions {
  /** API endpoint */
  api: string
  /** Callback when complete */
  onComplete?: (spec: Spec) => void
  /** Callback on error */
  onError?: (error: Error) => void
}

export interface UseUIStreamReturn {
  /** Current UI spec */
  spec: ShallowRef<Spec | null>
  /** Whether currently streaming */
  isStreaming: Ref<boolean>
  /** Error if any */
  error: Ref<Error | null>
  /** Token usage from the last generation */
  usage: Ref<TokenUsage | null>
  /** Raw JSONL lines received from the stream */
  rawLines: Ref<string[]>
  /** Send a prompt to generate UI */
  send: (prompt: string, context?: Record<string, unknown>) => Promise<void>
  /** Clear the current spec */
  clear: () => void
}

// ============================================================================
// Parse helpers
// ============================================================================

type ParsedLine =
  | { type: 'patch'; patch: JsonPatch }
  | { type: 'usage'; usage: TokenUsage }
  | null

function parseLine(line: string): ParsedLine {
  try {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//')) {
      return null
    }
    const parsed = JSON.parse(trimmed)

    // Check for usage metadata
    if (parsed.__meta === 'usage') {
      return {
        type: 'usage',
        usage: {
          promptTokens: parsed.promptTokens ?? 0,
          completionTokens: parsed.completionTokens ?? 0,
          totalTokens: parsed.totalTokens ?? 0,
        },
      }
    }

    return { type: 'patch', patch: parsed as JsonPatch }
  }
  catch {
    return null
  }
}

// ============================================================================
// Spec manipulation helpers
// ============================================================================

function setSpecValue(spec: Spec, path: string, value: unknown): void {
  if (path === '/root') {
    spec.root = value as string
    return
  }

  if (path === '/state') {
    spec.state = value as Record<string, unknown>
    return
  }

  if (path.startsWith('/state/')) {
    if (!spec.state) spec.state = {}
    const statePath = path.slice('/state'.length)
    setAt(spec.state, statePath, value)
    return
  }

  if (path.startsWith('/elements/')) {
    const pathParts = path.slice('/elements/'.length).split('/')
    const elementKey = pathParts[0]
    if (!elementKey) return

    if (pathParts.length === 1) {
      spec.elements[elementKey] = value as UIElement
    }
    else {
      const element = spec.elements[elementKey]
      if (element) {
        const propPath = pathParts.slice(1).join('.')
        setAt(element as unknown as Record<string, unknown>, propPath, value)
      }
    }
  }
}

function removeSpecValue(spec: Spec, path: string): void {
  if (path === '/state') {
    delete spec.state
    return
  }

  if (path.startsWith('/state/') && spec.state) {
    const statePath = path.slice('/state'.length)
    removeAt(spec.state, statePath)
    return
  }

  if (path.startsWith('/elements/')) {
    const pathParts = path.slice('/elements/'.length).split('/')
    const elementKey = pathParts[0]
    if (!elementKey) return

    if (pathParts.length === 1) {
      delete spec.elements[elementKey]
    }
    else {
      const element = spec.elements[elementKey]
      if (element) {
        const propPath = pathParts.slice(1).join('.')
        removeAt(element as unknown as Record<string, unknown>, propPath)
      }
    }
  }
}

function getSpecValue(spec: Spec, path: string): unknown {
  if (path === '/root') return spec.root
  if (path === '/state') return spec.state
  if (path.startsWith('/state/') && spec.state) {
    const statePath = path.slice('/state'.length)
    return getAt(spec.state, statePath)
  }
  if (path.startsWith('/elements/')) {
    const pathParts = path.slice('/elements/'.length).split('/')
    const elementKey = pathParts[0]
    if (!elementKey) return undefined
    if (pathParts.length === 1) return spec.elements[elementKey]
    const element = spec.elements[elementKey]
    if (!element) return undefined
    const propPath = pathParts.slice(1).join('.')
    return getAt(element as unknown as Record<string, unknown>, propPath)
  }
  return undefined
}

function applyPatch(spec: Spec, patch: JsonPatch): Spec {
  const newSpec: Spec = {
    ...spec,
    elements: { ...spec.elements },
    ...(spec.state ? { state: { ...spec.state } } : {}),
  }

  switch (patch.op) {
    case 'add':
    case 'replace': {
      setSpecValue(newSpec, patch.path, patch.value)
      break
    }
    case 'remove': {
      removeSpecValue(newSpec, patch.path)
      break
    }
    case 'move': {
      if (!patch.from) break
      const moveValue = getSpecValue(newSpec, patch.from)
      removeSpecValue(newSpec, patch.from)
      setSpecValue(newSpec, patch.path, moveValue)
      break
    }
    case 'copy': {
      if (!patch.from) break
      const copyValue = getSpecValue(newSpec, patch.from)
      setSpecValue(newSpec, patch.path, copyValue)
      break
    }
    case 'test': {
      // test is a no-op for rendering purposes
      break
    }
  }

  return newSpec
}

// ============================================================================
// Main Hook
// ============================================================================

export function useUIStream(options: UseUIStreamOptions): UseUIStreamReturn {
  const spec = shallowRef<Spec | null>(null)
  const isStreaming = ref(false)
  const error = ref<Error | null>(null)
  const usage = ref<TokenUsage | null>(null)
  const rawLines = ref<string[]>([])
  const abortController = shallowRef<AbortController | null>(null)

  const clear = () => {
    spec.value = null
    error.value = null
    usage.value = null
    rawLines.value = []
  }

  const send = async (prompt: string, context?: Record<string, unknown>) => {
    // Abort any existing request
    abortController.value?.abort()
    abortController.value = new AbortController()

    isStreaming.value = true
    error.value = null
    usage.value = null
    rawLines.value = []

    // Start with previous spec if provided, otherwise empty spec
    const previousSpec = context?.previousSpec as Spec | undefined
    let currentSpec: Spec = previousSpec && previousSpec.root
      ? { ...previousSpec, elements: { ...previousSpec.elements } }
      : { root: '', elements: {} }
    spec.value = currentSpec

    try {
      const response = await fetch(options.api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          context,
          currentSpec,
        }),
        signal: abortController.value.signal,
      })

      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`
        try {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message
          }
          else if (errorData.error) {
            errorMessage = errorData.error
          }
        }
        catch {
          // Ignore JSON parsing errors
        }
        throw new Error(errorMessage)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete lines
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue
          const result = parseLine(trimmed)
          if (!result) continue
          if (result.type === 'usage') {
            usage.value = result.usage
          }
          else {
            rawLines.value = [...rawLines.value, trimmed]
            currentSpec = applyPatch(currentSpec, result.patch)
            spec.value = { ...currentSpec }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const trimmed = buffer.trim()
        const result = parseLine(trimmed)
        if (result) {
          if (result.type === 'usage') {
            usage.value = result.usage
          }
          else {
            rawLines.value = [...rawLines.value, trimmed]
            currentSpec = applyPatch(currentSpec, result.patch)
            spec.value = { ...currentSpec }
          }
        }
      }

      options.onComplete?.(currentSpec)
    }
    catch (err) {
      if ((err as Error).name === 'AbortError') {
        return
      }
      const e = err instanceof Error ? err : new Error(String(err))
      error.value = e
      options.onError?.(e)
    }
    finally {
      isStreaming.value = false
    }
  }

  // Cleanup on unmount when called inside setup
  if (getCurrentInstance()) {
    onUnmounted(() => {
      abortController.value?.abort()
    })
  }

  return {
    spec,
    isStreaming,
    error,
    usage,
    rawLines,
    send,
    clear,
  }
}

// ============================================================================
// Utility: Convert flat elements to tree spec
// ============================================================================

export function flatToTree(elements: FlatElement[]): Spec {
  const elementMap: Record<string, UIElement> = {}
  let root = ''

  // First pass: add all elements to map
  for (const element of elements) {
    elementMap[element.key] = {
      type: element.type,
      props: element.props,
      children: [],
      visible: element.visible,
    }
  }

  // Second pass: build parent-child relationships
  for (const element of elements) {
    if (element.parentKey) {
      const parent = elementMap[element.parentKey]
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(element.key)
      }
    }
    else {
      root = element.key
    }
  }

  return { root, elements: elementMap }
}
