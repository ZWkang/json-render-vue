# json-render-vue

Vue 3 implementation of the json-render framework - a JSON-driven UI rendering system.

[![Test Coverage](https://img.shields.io/badge/tests-51%2F51-success)](./test)
[![Build Status](https://img.shields.io/badge/build-passing-success)](./dist)

## Overview

`json-render-vue` is a Vue 3 port of [`@json-render/react`](https://github.com/vercel-labs/json-render) that enables you to define UI structure as JSON specifications and render them dynamically with Vue components. It provides **1:1 parity** with the React version, ensuring consistent behavior across platforms.

### Key Features

- 🎯 **JSON-Driven UI**: Define your entire UI structure in JSON format
- 🔄 **Reactive State Management**: Built on Vue 3's reactivity system with provide/inject
- 🎬 **Actions System**: 5 built-in actions (setState, pushState, removeState, push, pop) + custom handlers
- ✅ **Form Validation**: Field-level validation with touched states
- 👁️ **Conditional Visibility**: Show/hide elements based on state conditions
- 🔁 **Repeat Rendering**: Render arrays with `$item` and `$index` tokens
- 🌊 **UI Streaming**: Real-time UI updates via JSON Patch (RFC 6902)
- 🎨 **Component Registry**: Plug in any Vue component library (TDesign, Element Plus, etc.)
- 🛡️ **Error Boundaries**: Graceful error handling with `onErrorCaptured`
- 📦 **Tree-shakeable**: Only bundle what you use

## Installation

```bash
pnpm add json-render-vue
# or
npm install json-render-vue
# or
yarn add json-render-vue
```

### Peer Dependencies

```bash
pnpm add vue @vueuse/core
```

## Quick Start

### Basic Example

```vue
<script setup lang="ts">
import { Renderer } from 'json-render-vue'
import { Button, Input } from 'your-component-library'

// Define your component registry
const registry = {
  Button,
  Input,
}

// Define your UI spec
const spec = {
  root: 'form1',
  elements: {
    form1: {
      type: 'form',
      children: ['input1', 'button1'],
    },
    input1: {
      type: 'Input',
      props: {
        placeholder: 'Enter your name',
      },
    },
    button1: {
      type: 'Button',
      props: {
        label: 'Submit',
      },
    },
  },
  state: {
    name: '',
  },
}
</script>

<template>
  <Renderer :spec="spec" :registry="registry" />
</template>
```

## Core Concepts

### Spec Format

A `Spec` is the root structure for JSON UI definitions:

```typescript
interface Spec {
  /** Key of the root element */
  root: string
  /** Map of element keys to element definitions */
  elements: Record<string, UIElement>
  /** Initial state (optional) */
  state?: Record<string, unknown>
}
```

### UI Element

Each element in the `elements` map follows this structure:

```typescript
interface UIElement {
  /** Component type (must exist in registry) */
  type: string
  /** Props passed to the component */
  props?: Record<string, unknown>
  /** Array of child element keys */
  children?: string[]
  /** Visibility condition */
  visible?: VisibilityCondition
  /** Event handlers */
  on?: Record<string, ActionBinding | ActionBinding[]>
  /** Repeat configuration for arrays */
  repeat?: RepeatConfig
}
```

## Data Binding

### Two-Way Binding with v-model

```typescript
import { useDataBinding } from 'json-render-vue'

const emailBinding = useDataBinding<string>('form.email')
```

```vue
<template>
  <input v-model="emailBinding" />
</template>
```

### Read-Only Values

```typescript
import { useDataValue } from 'json-render-vue'

const userName = useDataValue<string>('user.name')
```

### Programmatic Access

```typescript
import { useDataContext } from 'json-render-vue'

const ctx = useDataContext()

// Read
const value = ctx.get('user.email')

// Write
ctx.set('user.email', 'new@example.com')

// Batch update
ctx.update({
  'user.name': 'John',
  'user.age': 30,
})
```

## Actions System

### Built-in Actions

#### 1. setState - Update a value at a path

```json
{
  "action": "setState",
  "params": {
    "path": "user.name",
    "value": "Alice"
  }
}
```

#### 2. pushState - Append to an array

```json
{
  "action": "pushState",
  "params": {
    "path": "todos",
    "value": { "id": "$id", "text": { "path": "/newTodoText" } }
  }
}
```

Supports dynamic value resolution:
- `"$id"` -> generates unique ID
- `{ "path": "form.title" }` -> reads from state by path

Path format notes:
- Dot/bracket path is supported (for example: `user.name`, `todos[0].title`)
- JSON Pointer is also supported (for example: `/user/name`, `/todos/0/title`)

#### 3. removeState - Remove from array by index

```json
{
  "action": "removeState",
  "params": {
    "path": "todos",
    "index": 2
  }
}
```

#### 4. push - Navigate to a new screen

```json
{
  "action": "push",
  "params": {
    "screen": "detailView"
  }
}
```

#### 5. pop - Navigate back

```json
{
  "action": "pop"
}
```

### Custom Actions

```typescript
import { provideActions } from 'json-render-vue'

provideActions({
  handlers: {
    async submitForm(params) {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(params),
      })
      return response.json()
    },
  },
})
```

### Action Callbacks

```json
{
  "action": "submitForm",
  "params": { "name": "Alice" },
  "confirm": {
    "title": "Confirm Submission",
    "message": "Are you sure?"
  },
  "onSuccess": {
    "setState": { "message": "Success!" },
    "navigate": "/success"
  },
  "onError": {
    "setState": { "error": "Failed to submit" }
  }
}
```

## Validation

### Field-Level Validation

```typescript
import { useFieldValidation } from 'json-render-vue'

const emailValidation = useFieldValidation('form.email', (value) => {
  if (!value) return 'Email is required'
  if (!/\S[^\s@]*@\S+\.\S+/.test(value)) return 'Invalid email format'
  return null
})

// Access validation state
const { error, isValid, state, validate, touch, clear } = emailValidation
```

### Form-Level Validation

```typescript
import { useValidation } from 'json-render-vue'

const { register, validateAll, clearErrors } = useValidation()

// Register validators
register('form.email', (value) => value ? null : 'Required')
register('form.password', (value) => value?.length >= 8 ? null : 'Too short')

// Validate all fields
const isValid = validateAll() // returns boolean
```

## Conditional Visibility

### Basic Conditions

```json
{
  "type": "Button",
  "visible": {
    "path": "user.isAdmin",
    "value": true,
    "operator": "eq"
  }
}
```

### Operators

- `eq` - Equal (default)
- `neq` - Not equal
- `gt` / `gte` - Greater than / Greater or equal
- `lt` / `lte` - Less than / Less or equal
- `in` - Value in array/set/object
- `contains` - Array/set/object contains value

### Auth Conditions

```json
{
  "visible": {
    "path": "$auth.isSignedIn",
    "value": true
  }
}
```

## Repeat Rendering

Render arrays dynamically with `$item` and `$index` tokens:

```json
{
  "type": "div",
  "repeat": {
    "path": "todos",
    "key": "id"
  },
  "children": ["todoItem"],
  "elements": {
    "todoItem": {
      "type": "TodoItem",
      "props": {
        "text": { "path": "$item/text" },
        "index": "$index"
      },
      "on": {
        "delete": {
          "action": "removeState",
          "params": {
            "path": "todos",
            "index": "$index"
          }
        }
      }
    }
  }
}
```

## UI Streaming

Real-time UI updates using JSON Patch (RFC 6902):

```typescript
import { useUIStream } from 'json-render-vue'

const { spec, isStreaming, error, usage, send, clear } = useUIStream({
  api: '/api/generate-ui',
  onComplete: (finalSpec) => console.log('Done!', finalSpec),
  onError: (err) => console.error(err),
})

// Generate UI from prompt
await send('Create a login form', { theme: 'dark' })
```

### Supported JSON Patch Operations

- `add` - Add a new element or property
- `remove` - Remove an element or property
- `replace` - Replace an existing value
- `move` - Move from one path to another
- `copy` - Copy from one path to another
- `test` - Test a value (no-op for rendering)

## Component Integration

### TDesign Vue Next

```vue
<script setup lang="ts">
import { tdesignRegistry } from '@zwkang-dev/json-render-tdesign-vue-next'

const spec = {
  root: 'btn1',
  elements: {
    btn1: {
      type: 'Button',
      props: {
        theme: 'primary',
        content: 'Click Me',
      },
    },
  },
}
</script>

<template>
  <Renderer :spec="spec" :registry="tdesignRegistry" />
</template>
```

### Custom Components

```typescript
const registry = {
  MyButton: defineComponent({
    props: ['element'],
    setup(props) {
      const { execute } = useActions()
      const handleClick = () => {
        const clickAction = props.element?.on?.click
        if (clickAction) execute(clickAction)
      }
      return { handleClick }
    },
  }),
}
```

## API Reference

### Components

#### `<Renderer>`

Main entry point for rendering a spec.

```typescript
interface RendererProps {
  spec: Spec
  registry: Record<string, Component>
  data?: JsonRenderData | null
  actionConfig?: ProvideActionsConfig
  fallback?: Component
}
```

#### `<JSONUIProvider>`

Provider for custom setups.

```typescript
interface JSONUIProviderProps {
  data?: JsonRenderData
  initialState?: JsonRenderData
  authState?: AuthState
  onStateChange?: (path: string, value: unknown) => void
  actionConfig?: ProvideActionsConfig
}
```

#### `<ElementRenderer>`

Recursive element renderer (advanced usage).

```typescript
interface ElementRendererProps {
  elementKey?: string
  spec?: Spec
  element?: UIElement
  registry: Record<string, Component>
  fallback?: Component
  loading?: boolean
}
```

### Composables

- `useData()` - Access reactive data store
- `useDataContext()` - Full data context with get/set/update
- `useDataValue(path)` - Read-only computed value
- `useDataBinding(path)` - Two-way binding for v-model
- `useActions()` - Action execution context
- `useValidation()` - Form validation
- `useFieldValidation(path, validator)` - Field-level validation
- `useIsVisible(condition)` - Visibility evaluation
- `useUIStream(options)` - UI streaming
- `useRepeatScope()` - Access repeat scope ($item/$index)

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  ActionBinding,
  AuthState,
  JsonRenderData,
  RepeatConfig,
  Spec,
  UIElement,
  VisibilityCondition,
} from 'json-render-vue'
```

## Testing

```bash
pnpm test        # Run all tests
pnpm test:watch  # Watch mode
pnpm typecheck   # TypeScript type checking
```

**Test Coverage**: 51/51 tests passing (100%)

## Build

```bash
pnpm build       # Production build
pnpm dev         # Watch mode for development
```

**Bundle Size**: 26.22 kB (gzip: 7.38 kB)

## Comparison with React Version

| Feature | React | Vue 3 | Status |
|---------|-------|-------|--------|
| JSON Spec Format | ✅ | ✅ | 1:1 Parity |
| State Management | Context | Provide/Inject | ✅ |
| Data Binding | useState | ref/computed | ✅ |
| Actions System | ✅ | ✅ | 1:1 Parity |
| Validation | ✅ | ✅ | Enhanced |
| Visibility | ✅ | ✅ | 1:1 Parity |
| Repeat Rendering | ✅ | ✅ | 1:1 Parity |
| UI Streaming | ✅ | ✅ | 1:1 Parity |
| Error Boundaries | ✅ | ✅ | onErrorCaptured |

## Examples

See the [examples](../../examples) directory for complete working examples:

- Basic form rendering
- Dynamic actions
- Form validation
- Conditional visibility
- Array rendering with repeat
- UI streaming
- TDesign integration

## License

[MIT](./LICENSE) License © 2024 [zwkang](https://github.com/zwkang)

## Contributing

Contributions are welcome! Please read our [contributing guide](../../CONTRIBUTING.md) first.

## Acknowledgments

This project is a Vue 3 port of [`@json-render/react`](https://github.com/vercel-labs/json-render) by Vercel Labs.
