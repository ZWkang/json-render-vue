<script setup lang="ts">
import { computed, onErrorCaptured, ref } from 'vue'
import type { Component } from 'vue'

import type { Spec, UIElement } from '../types/catalog-types'
import { useIsVisible } from '../composables/useVisibility'
import { useActions } from '../composables/useActions'
import { useDataContext } from '../composables/useData'
import { useRepeatScope, provideRepeatScope, rewriteRepeatTokens } from '../composables/useRepeatScope'
import { getAt } from '../utils/path'

defineOptions({ name: 'ElementRenderer' })

const props = defineProps<{
  /** Element key (when using Spec format) */
  elementKey?: string
  /** Full spec (when using Spec format) */
  spec?: Spec
  /** Direct element (legacy format) */
  element?: UIElement
  /** Component registry */
  registry: Record<string, Component>
  /** Fallback component for unknown types */
  fallback?: Component
  /** Whether spec is loading/streaming */
  loading?: boolean
}>()

// Error boundary state
const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((error) => {
  hasError.value = true
  errorMessage.value = error.message
  console.error(`[json-render] Rendering error:`, error)
  return false // Prevent error propagation
})

// Get contexts
const repeatScope = useRepeatScope()
const { execute } = useActions()
const dataCtx = useDataContext()

// Resolve element from spec or direct prop
const resolvedElement = computed<UIElement | null>(() => {
  if (props.element) {
    return props.element
  }
  if (props.spec && props.elementKey) {
    return props.spec.elements[props.elementKey] ?? null
  }
  return null
})

// Apply repeat token rewriting if inside a repeat scope
const effectiveElement = computed<UIElement | null>(() => {
  const el = resolvedElement.value
  if (!el) return null
  if (!repeatScope) return el

  const rewrittenProps = rewriteRepeatTokens(
    el.props,
    repeatScope.basePath,
    repeatScope.index,
  ) as Record<string, unknown> | undefined

  const rewrittenVisible = el.visible !== undefined
    ? rewriteRepeatTokens(el.visible, repeatScope.basePath, repeatScope.index)
    : el.visible

  const rewrittenOn = el.on !== undefined
    ? rewriteRepeatTokens(el.on, repeatScope.basePath, repeatScope.index)
    : el.on

  if (
    rewrittenProps !== el.props ||
    rewrittenVisible !== el.visible ||
    rewrittenOn !== el.on
  ) {
    return {
      ...el,
      props: rewrittenProps,
      visible: rewrittenVisible as UIElement['visible'],
      on: rewrittenOn as UIElement['on'],
    }
  }

  return el
})

// Check visibility
const isVisible = useIsVisible(() => effectiveElement.value?.visible)

// Resolve component from registry
const resolvedComponent = computed<Component | null>(() => {
  const el = effectiveElement.value
  if (!el?.type) return props.fallback ?? null
  return props.registry[el.type] ?? props.fallback ?? null
})

// Create emit function for events
const emit = (eventName: string) => {
  const el = effectiveElement.value
  const binding = el?.on?.[eventName]
  if (!binding) return

  const bindings = Array.isArray(binding) ? binding : [binding]
  for (const b of bindings) {
    void execute(b).catch((err) => {
      console.error("json-render action execution failed:", err)
    })
  }
}

// Get repeat items if element has repeat config
const repeatItems = computed<{ key: string; index: number }[]>(() => {
  const el = effectiveElement.value
  if (!el?.repeat) return []

  const items = (getAt(dataCtx.state.value, el.repeat.path) as unknown[]) ?? []
  return items.map((item, index) => {
    const key = el.repeat!.key && typeof item === 'object' && item !== null
      ? String((item as Record<string, unknown>)[el.repeat!.key] ?? index)
      : String(index)
    return { key, index }
  })
})

// Check if this is a repeat element
const isRepeatElement = computed(() => !!effectiveElement.value?.repeat)

// Get children keys
const childrenKeys = computed<string[]>(() => {
  const el = effectiveElement.value
  if (!el?.children) return []
  return el.children
})

// Build props to pass to component
const componentProps = computed(() => {
  const el = effectiveElement.value
  return {
    ...(el?.props ?? {}),
    element: el,
    emit,
    loading: props.loading,
  }
})
</script>

<template>
  <!-- Error boundary -->
  <template v-if="hasError">
    <!-- Silently fail - element disappears rather than crashing -->
  </template>

  <!-- Normal rendering -->
  <template v-else-if="isVisible && effectiveElement">
    <!-- Repeat rendering -->
    <template v-if="isRepeatElement">
      <template v-for="item in repeatItems" :key="item.key">
        <RepeatScopeWrapper
          :base-path="`${effectiveElement.repeat!.path}/${item.index}`"
          :index="item.index"
        >
          <template v-for="childKey in childrenKeys" :key="childKey">
            <ElementRenderer
              :element-key="childKey"
              :spec="spec"
              :registry="registry"
              :fallback="fallback"
              :loading="loading"
            />
          </template>
        </RepeatScopeWrapper>
      </template>
    </template>

    <!-- Normal rendering -->
    <template v-else>
      <component
        :is="resolvedComponent"
        v-if="resolvedComponent"
        v-bind="componentProps"
      >
        <template v-for="childKey in childrenKeys" :key="childKey">
          <ElementRenderer
            :element-key="childKey"
            :spec="spec"
            :registry="registry"
            :fallback="fallback"
            :loading="loading"
          />
        </template>
      </component>
    </template>
  </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

// Helper component to provide repeat scope
const RepeatScopeWrapper = defineComponent({
  name: 'RepeatScopeWrapper',
  props: {
    basePath: { type: String, required: true },
    index: { type: Number, required: true },
  },
  setup(props, { slots }) {
    provideRepeatScope({ basePath: props.basePath, index: props.index })
    return () => slots.default?.()
  },
})
</script>
