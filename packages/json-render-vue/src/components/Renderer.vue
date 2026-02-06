<script setup lang="ts">
import type { Component } from 'vue'
import type { Spec } from '../types/catalog-types'
import type { JsonRenderData } from '../composables/useData'
import type { ProvideActionsConfig } from '../composables/useActions'
import JSONUIProvider from './JSONUIProvider.vue'
import ElementRenderer from './ElementRenderer.vue'

defineOptions({ name: 'Renderer' })

defineProps<{
  spec: Spec
  registry: Record<string, Component>
  data?: JsonRenderData
  actionConfig?: ProvideActionsConfig
  fallback?: Component
}>()
</script>

<template>
  <JSONUIProvider :data="data" :action-config="actionConfig">
    <ElementRenderer :element="spec" :registry="registry" :fallback="fallback" />
  </JSONUIProvider>
</template>
