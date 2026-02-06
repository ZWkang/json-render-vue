<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

import type { Spec } from '../types/catalog-types'

defineOptions({ name: 'ElementRenderer' })

const props = defineProps<{
  element: Spec
  registry: Record<string, Component>
  fallback?: Component
}>()

const resolvedComponent = computed<Component | null>(() => {
  const type = props.element?.type
  if (!type)
    return props.fallback ?? null
  return props.registry[type] ?? props.fallback ?? null
})

// Bind element fields to the rendered component, but render children via slots/recursion.
// We still pass `children` explicitly as a prop for components that prefer it.
const elementBind = computed<Record<string, any>>(() => {
  const { children: _children, ...rest } = props.element as any
  return rest
})

const childrenArray = computed<Spec[]>(() =>
  Array.isArray(props.element.children) ? props.element.children : [],
)

const childrenText = computed<string | null>(() =>
  typeof props.element.children === 'string' ? props.element.children : null,
)

function getChildKey(child: Spec, index: number) {
  const anyChild = child as any
  return anyChild.key ?? anyChild.id ?? index
}
</script>

<template>
  <component
    :is="resolvedComponent"
    v-if="resolvedComponent"
    v-bind="elementBind"
    :element="element"
    :children="element.children"
  >
    <template v-if="childrenArray.length">
      <ElementRenderer
        v-for="(child, index) in childrenArray"
        :key="getChildKey(child, index)"
        :element="child"
        :registry="registry"
        :fallback="fallback"
      />
    </template>
    <template v-else-if="childrenText !== null">
      {{ childrenText }}
    </template>
  </component>
</template>
