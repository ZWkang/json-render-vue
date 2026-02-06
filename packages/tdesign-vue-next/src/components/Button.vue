<script setup lang="ts">
import { useActions, type Spec } from 'json-render-vue'
import { Button as TButton } from 'tdesign-vue-next'

const props = defineProps<{
  element: Spec
  loading?: boolean
}>()

const { execute } = useActions()

function handleClick() {
  if (props.element.props?.action) {
    execute({ type: props.element.props.action })
  }
}
</script>

<template>
  <TButton
    :theme="element.props?.theme || 'default'"
    :variant="element.props?.variant || 'base'"
    :size="element.props?.size || 'medium'"
    :disabled="element.props?.disabled || loading"
    :loading="element.props?.loading || loading"
    :block="element.props?.block"
    @click="handleClick"
  >
    {{ element.props?.label }}
  </TButton>
</template>
