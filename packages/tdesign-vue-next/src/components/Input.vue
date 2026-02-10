<script setup lang="ts">
import { computed } from "vue"
import type { InputValue } from "tdesign-vue-next"
import { Input as TInput } from "tdesign-vue-next"
import type { UIElement } from "json-render-vue"
import { useDataBinding } from "json-render-vue"

const props = defineProps<{
  element: UIElement
}>()

const elementProps = computed(() => (props.element.props ?? {}) as Record<string, unknown>)
const path = computed(() => String(elementProps.value.valuePath ?? ""))
const rawValue = useDataBinding<InputValue>(path.value)

const value = computed<InputValue>({
  get: () => rawValue.value,
  set: v => (rawValue.value = v),
})
</script>

<template>
  <div class="tdesign-input-wrapper">
    <label v-if="elementProps.label" class="tdesign-input-label">
      {{ elementProps.label }}
    </label>
    <TInput
      v-model="value"
      :placeholder="elementProps.placeholder as string | undefined"
      :type="(elementProps.type as any) || 'text'"
      :disabled="Boolean(elementProps.disabled)"
      :clearable="Boolean(elementProps.clearable)"
      :maxlength="elementProps.maxlength as string | number | undefined"
      :show-word-limit="Boolean(elementProps.showWordLimit)"
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
