<script setup lang="ts">
import type { Spec } from 'json-render-vue'
import { useDataBinding } from 'json-render-vue'
import { Input as TInput } from 'tdesign-vue-next'

const props = defineProps<{
  element: Spec
}>()

const value = useDataBinding<string | number>(props.element.props?.valuePath ?? '')
</script>

<template>
  <div class="tdesign-input-wrapper">
    <label v-if="element.props?.label" class="tdesign-input-label">
      {{ element.props?.label }}
    </label>
    <TInput
      v-model="value as InputValue"
      :placeholder="element.props?.placeholder"
      :type="element.props?.type || 'text'"
      :disabled="element.props?.disabled"
      :clearable="element.props?.clearable"
      :maxlength="element.props?.maxlength"
      :show-word-limit="element.props?.showWordLimit"
    />
  </div>
</template>

<style scoped>
.tdesign-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tdesign-input-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
}
</style>
