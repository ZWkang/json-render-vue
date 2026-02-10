import type { Component } from 'vue'
import type { JsonRenderData } from '../composables/useData'
import type { ProvideActionsConfig } from '../composables/useActions'
import type { Spec } from './catalog-types'

/**
 * Props for the Renderer component.
 * Use this to type your spec, registry, and data when using <Renderer />.
 */
export interface RendererProps {
  spec: Spec
  registry: Record<string, Component>
  data?: JsonRenderData | null
  actionConfig?: ProvideActionsConfig
  fallback?: Component
}
