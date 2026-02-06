<script setup lang="ts">
import { provideActions } from '../composables/useActions'
import type { ProvideActionsConfig } from '../composables/useActions'
import { provideData } from '../composables/useData'
import type { JsonRenderData } from '../composables/useData'
import { provideValidation } from '../composables/useValidation'
import ConfirmDialog from './ConfirmDialog.vue'

defineOptions({ name: 'JSONUIProvider' })

const props = defineProps<{
  data?: JsonRenderData
  actionConfig?: ProvideActionsConfig
  validationConfig?: unknown
}>()

const dataStore = provideData(props.data ?? {})
provideActions(props.actionConfig)
provideValidation(dataStore)
</script>

<template>
  <slot />
  <ConfirmDialog />
</template>
