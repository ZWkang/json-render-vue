/**
 * UI Element definition - matches React json-render format
 */
export interface UIElement<T extends string = string, P = Record<string, unknown>> {
  type: T
  props?: P
  children?: string[]
  visible?: VisibilityCondition
  on?: Record<string, ActionBinding | ActionBinding[]>
  repeat?: RepeatConfig
}

/**
 * Repeat configuration for rendering arrays
 */
export interface RepeatConfig {
  /** Path to the array in state */
  path: string
  /** Key field for stable rendering */
  key?: string
}

/**
 * Visibility condition
 */
export interface VisibilityCondition {
  path: string
  value?: unknown
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains'
}

/**
 * Action binding
 */
export interface ActionBinding {
  action: string
  params?: Record<string, unknown>
  confirm?: ActionConfirm
  onSuccess?: ActionOnSuccess
  onError?: ActionOnError
}

export interface ActionConfirm {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
}

export interface ActionOnSuccess {
  action?: string
  navigate?: string
  setState?: Record<string, unknown>
}

export interface ActionOnError {
  action?: string
  setState?: Record<string, unknown>
}

/**
 * Full UI Spec - the root structure for JSON UI definitions
 */
export interface Spec {
  /** Key of the root element */
  root: string
  /** Map of element keys to element definitions */
  elements: Record<string, UIElement>
  /** Initial state */
  state?: Record<string, unknown>
}

/**
 * Legacy Spec format for backwards compatibility
 */
export interface LegacySpec {
  type: string
  props?: Record<string, unknown>
  children?: LegacySpec[] | string
  [key: string]: unknown
}

/**
 * Flat element format (for streaming)
 */
export interface FlatElement {
  key: string
  type: string
  props?: Record<string, unknown>
  parentKey?: string
  visible?: VisibilityCondition
}

/**
 * JSON Patch operation (RFC 6902)
 */
export type PatchOp = 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'

export interface JsonPatch {
  op: PatchOp
  path: string
  value?: unknown
  from?: string
}

/**
 * Token usage metadata from AI generation
 */
export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

/**
 * Data binding tuple (legacy)
 */
export type DataBinding = [unknown, (value: unknown) => void]

// Re-export Action as alias for ActionBinding
export type Action = ActionBinding
