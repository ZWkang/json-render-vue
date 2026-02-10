<script setup lang="ts">
import { computed } from "vue"
import type { UIElement } from "json-render-vue"
import { Card as TCard } from "tdesign-vue-next"

const props = defineProps<{
  element: UIElement
}>()

const elementProps = computed(() => (props.element.props ?? {}) as Record<string, unknown>)
</script>

<template>
  <TCard
    :title="elementProps.title as any"
    :subtitle="elementProps.subtitle as any"
    :bordered="elementProps.bordered as boolean | undefined"
    :shadow="elementProps.shadow as boolean | undefined"
    :hoverable="elementProps.hoverable as boolean | undefined"
  >
    <slot />
  </TCard>
</template>
