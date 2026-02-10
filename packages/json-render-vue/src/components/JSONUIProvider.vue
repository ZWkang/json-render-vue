<script setup lang="ts">
import { provideActions } from '../composables/useActions'
import type { ProvideActionsConfig } from '../composables/useActions'
import { provideData } from '../composables/useData'
import type { JsonRenderData, AuthState } from '../composables/useData'
import { provideValidation } from '../composables/useValidation'
import ConfirmDialog from './ConfirmDialog.vue'

defineOptions({ name: 'JSONUIProvider' })

const props = defineProps<{
  data?: JsonRenderData
  initialState?: JsonRenderData
  authState?: AuthState
  actionConfig?: ProvideActionsConfig
  onStateChange?: (path: string, value: unknown) => void
}>()

// Use new API with full options
const dataCtx = provideData({
  initialState: props.initialState ?? props.data ?? {},
  authState: props.authState,
  onStateChange: props.onStateChange,
})
provideActions(props.actionConfig)
provideValidation(dataCtx.state)
</script>

<template>
  <slot />
  <ConfirmDialog />
</template>
