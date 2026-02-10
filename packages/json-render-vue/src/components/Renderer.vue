<script setup lang="ts">
import type { RendererProps } from '../types/renderer-types'
import JSONUIProvider from './JSONUIProvider.vue'
import ElementRenderer from './ElementRenderer.vue'

defineOptions({ name: 'Renderer' })

defineProps<RendererProps>()
</script>

<template>
  <JSONUIProvider :data="data ?? undefined" :action-config="actionConfig">
    <ElementRenderer
      :spec="spec"
      :element-key="spec?.root"
      :registry="registry"
      :fallback="fallback"
    />
  </JSONUIProvider>
</template>
