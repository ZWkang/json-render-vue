// Types
export * from './types/catalog-types'
export type { RendererProps } from './types/renderer-types'

// Components
export { default as Renderer } from './components/Renderer.vue'
export { default as JSONUIProvider } from './components/JSONUIProvider.vue'
export { default as ElementRenderer } from './components/ElementRenderer.vue'
export { default as ConfirmDialog } from './components/ConfirmDialog.vue'

// Composables - explicit exports to avoid conflicts
export {
  provideData,
  useData,
  useDataContext,
  useDataValue,
  useDataBinding,
  type JsonRenderData,
  type JsonRenderDataStore,
  type AuthState,
  type DataContextValue,
  type ProvideDataOptions,
} from './composables/useData'

export {
  provideActions,
  useActions,
  useAction,
  type ActionsContext,
  type ProvideActionsConfig,
  type ActionHandler,
  type PendingConfirmation,
} from './composables/useActions'

export {
  provideValidation,
  useValidation,
  useValidationError,
  useFieldValidation,
  type Validator,
  type FieldValidationState,
  type ValidationContext,
} from './composables/useValidation'

export { useIsVisible } from './composables/useVisibility'

export {
  useUIStream,
  flatToTree,
  type UseUIStreamOptions,
  type UseUIStreamReturn,
} from './composables/useUIStream'

export {
  provideRepeatScope,
  useRepeatScope,
  rewriteRepeatTokens,
  type RepeatScopeValue,
} from './composables/useRepeatScope'

// Utils
export { parsePath, getAt, setAt, removeAt, type PathSegment } from './utils/path'
