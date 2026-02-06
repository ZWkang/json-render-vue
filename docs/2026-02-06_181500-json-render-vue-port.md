# Implementation Plan - JSON Render Vue Port

## Context
We are porting the `@json-render/react` package to Vue 3 (`@json-render/vue`). The goal is to replicate the functionality of the React version **exactly (1:1 parity)**.
*Note: This may require updates to consumers like `tdesign-vue-next` later, as we are prioritizing strict parity with the React reference implementation over existing consumer compatibility.*

## Architecture Decisions
- **Component Style**: **Vue Single File Components (.vue)** with `<template>` and `<script setup>`.
- **State Management**: **Vue Provide/Inject** API with reactive Composables. Keys will use string identifiers (e.g., `'@json-render/data'`) to prevent symbol identity issues.
- **Dependencies**: `vue`, `@vueuse/core` (for reactivity utilities).
- **API Surface**: Will match `@json-render/react` exactly (e.g., `Renderer` takes `spec`, not `tree`).

## File Structure
```text
packages/json-render-vue/src/
├── components/
│   ├── ElementRenderer.vue       # Recursive core renderer (SFC)
│   ├── JSONUIProvider.vue        # Main entry provider (wraps all contexts)
│   ├── Renderer.vue              # Entry point for rendering a Spec
│   └── ConfirmDialog.vue         # Confirmation modal
├── composables/
│   ├── useActions.ts             # Action logic
│   ├── useData.ts                # Data model (useData, useDataValue, useDataBinding)
│   ├── useValidation.ts          # Validation registry
│   ├── useVisibility.ts          # Visibility evaluation
│   └── useUIStream.ts            # Streaming logic (ref-based)
├── types/
│   └── catalog-types.ts          # Shared types
└── index.ts                      # Public API exports
```

## Implementation Status

### ✅ Completed

#### 1. Project Setup
- [x] Install `@vueuse/core`
- [x] Ensure peer dependencies (`vue`, `@json-render/core`)
- [x] Configure Vite build with vue plugin and dts

#### 2. Core Composables (Logic Layer)
- [x] **`useData.ts`**:
  - `provideData(initialData)`: Use `ref` for deep reactivity
  - `useDataBinding(path)`: Return `WritableComputedRef` for v-model support
  - `useDataValue(path)`: Return `ComputedRef`
- [x] **`useActions.ts`**:
  - Implement `execute`, `confirm`, `cancel`
  - Manage `pendingConfirmation` and `loadingActions`
- [x] **`useVisibility.ts`**:
  - `useIsVisible(condition)`: Return `ComputedRef<boolean>`
  - Support operators: eq, neq, gt, gte, lt, lte, in, contains
- [x] **`useValidation.ts`**:
  - Implement validation registry and status tracking
  - `register`, `validateAll`, `clearErrors`, `useValidationError`

#### 3. Streaming Logic
- [x] **`useUIStream.ts`**:
  - Use `shallowRef<Spec | null>` for the main state
  - Implement `update` with merge/replace logic
  - Use `AbortController` for cancellation

#### 4. Vue Components (UI Layer)
- [x] **`ElementRenderer.vue`**:
  - Props: `element`, `registry`, `fallback`
  - Recursion via `<ElementRenderer v-for="...">`
  - Dynamic component via `<component :is="...">`
- [x] **`JSONUIProvider.vue`**:
  - Instantiates all providers (data, actions, validation)
  - Renders `<slot />` + `<ConfirmDialog />`
- [x] **`Renderer.vue`**:
  - Props: `spec`, `registry`, `data`, `actionConfig`, `fallback`
  - Wraps `JSONUIProvider` -> `ElementRenderer`
- [x] **`ConfirmDialog.vue`**:
  - Teleport-based modal with customizable slots

#### 5. Public API (`index.ts`)
- [x] Export components: `Renderer`, `JSONUIProvider`, `ElementRenderer`, `ConfirmDialog`
- [x] Export composables: `useDataBinding`, `useData`, `useActions`, etc.
- [x] Re-export types

#### 6. Testing
- [x] 50 tests covering all composables and components
- [x] Test infrastructure: vitest, happy-dom, @vue/test-utils

#### 7. TDesign Integration
- [x] Update `tdesign-vue-next` components to use new API
- [x] Fix type compatibility issues

## API Reference

### Components

```html
<!-- Main renderer -->
<Renderer :spec="spec" :registry="registry" :data="initialData" />

<!-- Provider for custom setups -->
<JSONUIProvider :data="data" :action-config="config">
  <slot />
</JSONUIProvider>
```

**TypeScript（在 .vue 里用时）：** 若在组件里报类型错误，可为变量标注类型或使用 `RendererProps`；上面是文档示例，用 `html` 代码块避免在 md 里被当成 TS 检查。

### Composables

```ts
// Data binding with v-model support
const value = useDataBinding<string>('form.email')
// Usage: <input v-model="value" />

// Read-only computed value
const name = useDataValue<string>('user.name')

// Actions
const { execute, confirm, cancel, pendingConfirmation, loadingActions } = useActions()

// Visibility
const isVisible = useIsVisible({ path: 'status', value: 'active', operator: 'eq' })

// Validation
const { register, validateAll, clearErrors } = useValidation()
const error = useValidationError('email')
```

## Commits
1. `feat(vue): port @json-render/react to vue 3`
2. `fix(tdesign-vue-next): update dependencies and component implementations`
3. `test(vue): add comprehensive test suite with 50 tests`
4. `refactor(vue): change useDataBinding to return WritableComputedRef`
