<script setup lang="ts">
import { computed } from "vue"
import type { UIElement } from "json-render-vue"
import { useActions } from "json-render-vue"
import { Button as TButton } from "tdesign-vue-next"

const props = defineProps<{
  element: UIElement
  loading?: boolean
}>()

const { execute } = useActions()
const elementProps = computed(() => (props.element.props ?? {}) as Record<string, unknown>)

function handleClick() {
  const action = elementProps.value.action
  if (typeof action === "string" && action.length > 0) {
    void execute({ action })
  }
}
</script>

<template>
  <TButton
    :theme="(elementProps.theme as any) || 'default'"
    :variant="(elementProps.variant as any) || 'base'"
    :size="(elementProps.size as any) || 'medium'"
    :disabled="Boolean(elementProps.disabled) || loading"
    :loading="Boolean(elementProps.loading) || loading"
    :block="Boolean(elementProps.block)"
    @click="handleClick"
  >
    {{ elementProps.label }}
  </TButton>
</template>
