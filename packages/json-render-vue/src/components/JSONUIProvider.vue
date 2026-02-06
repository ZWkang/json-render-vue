<script setup lang="ts">
import ConfirmDialog from './ConfirmDialog.vue'

import { provideActions } from '../composables/useActions'
import type { ProvideActionsConfig } from '../composables/useActions'
import { provideData } from '../composables/useData'
import type { JsonRenderData } from '../composables/useData'
import { provideValidation } from '../composables/useValidation'

defineOptions({ name: 'JSONUIProvider' })

const props = defineProps<{
  data?: JsonRenderData
  actionConfig?: ProvideActionsConfig
  validationConfig?: unknown
}>()

provideData(props.data ?? {})
provideActions(props.actionConfig)
provideValidation()
</script>

<template>
  <slot />
  <ConfirmDialog />
</template>
