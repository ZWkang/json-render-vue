<script setup lang="ts">
import type { Spec } from 'json-render-vue'
import { Card as TCard } from 'tdesign-vue-next'

defineProps<{
  element: Spec
}>()
</script>

<template>
  <TCard
    :title="element.props?.title"
    :subtitle="element.props?.subtitle"
    :bordered="element.props?.bordered ?? true"
    :shadow="element.props?.shadow"
    :hoverable="element.props?.hoverable"
  >
    <slot />
  </TCard>
</template>
