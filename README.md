<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.3+-42b883?style=flat-square&logo=vue.js" alt="Vue 3.3+">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="MIT License">
  <img src="https://img.shields.io/npm/v/json-render-vue?style=flat-square&color=cb3837&logo=npm" alt="npm">
</p>

<h1 align="center">🎨 json-render-vue</h1>

<p align="center">
  <strong>Vue 3 implementation of the json-render framework</strong><br>
  <sub>A powerful JSON-driven UI rendering system</sub>
</p>

<p align="center">
  <a href="#-installation">Installation</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-core-concepts">Core Concepts</a> •
  <a href="#-api">API</a> •
  <a href="#-packages">Packages</a>
</p>

---

## ✨ Features

- 🚀 **JSON-Driven** - Define UI structure as JSON, render with Vue
- 🔗 **Two-Way Binding** - Automatic data binding with path syntax
- 🧩 **Pluggable** - Bring your own component library
- 📦 **Tree-Shakable** - Only bundle what you use
- 🎯 **TypeScript** - Full type support out of the box

---

## 📦 Installation

```bash
# Core package
pnpm add json-render-vue

# TDesign component bindings (optional)
pnpm add @zwkang-dev/tdesign-vue-next
```

---

## 🚀 Quick Start

```vue
<script setup lang="ts">
import { Renderer } from 'json-render-vue'
import { tdesignRegistry } from '@zwkang-dev/tdesign-vue-next'

const spec = {
  type: 'Card',
  props: { title: 'Hello World' },
  children: [
    {
      type: 'Input',
      props: { placeholder: 'Enter your name' },
      bindData: 'user.name'
    },
    {
      type: 'Button',
      props: { theme: 'primary' },
      children: 'Submit'
    }
  ]
}

const data = {
  user: { name: '' }
}
</script>

<template>
  <Renderer :spec="spec" :registry="tdesignRegistry" :data="data" />
</template>
```

---

## 📖 Core Concepts

### Renderer

> Top-level component that combines `JSONUIProvider` and `ElementRenderer`

```vue
<Renderer
  :spec="spec"
  :registry="registry"
  :data="initialData"
  :action-config="actionConfig"
/>
```

### JSON Spec Structure

```ts
interface ElementSpec {
  type: string              // Component type name
  props?: object            // Props passed to component
  children?: ElementSpec[]  // Nested elements
  bindData?: string         // Two-way data binding path
  visible?: string          // Visibility condition
}
```

### Data Binding

Use `bindData` for two-way binding with path syntax:

```js
const spec = {
  type: 'Input',
  bindData: 'form.email'  // Binds to data.form.email
}
```

| Syntax | Example | Description |
|--------|---------|-------------|
| Dot notation | `user.name` | Access nested properties |
| Array index | `items[0].id` | Access array elements |
| Bracket notation | `data["key"]` | Access with string keys |

---

## 🔧 API

### Composables

```ts
import {
  useData,
  useDataBinding,
  useDataValue,
  useActions,
  useValidation,
  useVisibility
} from 'json-render-vue'
```

| Composable | Description |
|------------|-------------|
| `useData()` | Access shared data store |
| `useDataBinding(path)` | Two-way binding (WritableComputedRef) |
| `useDataValue(path)` | Read-only computed value |
| `useActions()` | Action handling system |
| `useValidation()` | Form validation utilities |
| `useVisibility()` | Conditional visibility |

### Example

```ts
// In component setup
const { data, setData, getData } = useData()

// Two-way binding
const name = useDataBinding('user.name')
name.value = 'John'  // Updates data.user.name

// Read-only
const email = useDataValue('user.email')
```

---

## 🧩 Component Registry

Create custom registries by mapping type names to Vue components:

```ts
import { Card, Button, Input } from 'your-ui-library'

const customRegistry: Record<string, Component> = {
  Card,
  Button,
  Input,
}
```

### TDesign Bindings

Pre-built registry for [TDesign Vue Next](https://tdesign.tencent.com/vue-next/):

```ts
import { tdesignRegistry } from '@zwkang-dev/tdesign-vue-next'

// Available: Card, Button, Input
```

---

## 📦 Packages

| Package | Description | Status |
|---------|-------------|--------|
| `json-render-vue` | Core Vue 3 rendering framework | ✅ Stable |
| `@zwkang-dev/tdesign-vue-next` | TDesign Vue Next bindings | 🚧 Beta |

---

## 🛠 Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test             # Run tests
pnpm lint             # Lint codebase
pnpm typecheck        # TypeScript type checking
```

---

## 📄 License

[MIT](./LICENSE) © [zwkang](https://github.com/ZWkang)

---

<p align="center">
  <sub>Built with ❤️ for the Vue ecosystem</sub>
</p>
