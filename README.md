<p align="center">
  <a href="https://github.com/ZWkang/json-render-vue/actions/workflows/test.yml"><img src="https://img.shields.io/github/actions/workflow/status/ZWkang/json-render-vue/test.yml?branch=main&style=flat-square&logo=github&label=tests" alt="Tests"></a>
  <a href="https://github.com/ZWkang/json-render-vue/actions/workflows/release.yml"><img src="https://img.shields.io/github/actions/workflow/status/ZWkang/json-render-vue/release.yml?style=flat-square&logo=github&label=release" alt="Release"></a>
  <a href="https://www.npmjs.com/package/json-render-vue"><img src="https://img.shields.io/npm/v/json-render-vue?style=flat-square&color=cb3837&logo=npm" alt="npm"></a>
  <img src="https://img.shields.io/badge/Vue-3.3+-42b883?style=flat-square&logo=vue.js" alt="Vue 3.3+">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=flat-square&logo=typescript" alt="TypeScript">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="MIT License"></a>
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
pnpm add @zwkang-dev/json-render-tdesign-vue-next
```

---

## 🚀 Quick Start

```vue
<script setup lang="ts">
import { Renderer } from 'json-render-vue'
import { tdesignRegistry } from '@zwkang-dev/json-render-tdesign-vue-next'

const spec = {
  root: 'card-1',
  elements: {
    'card-1': {
      type: 'Card',
      props: { title: 'Hello World' },
      children: ['input-1', 'button-1'],
    },
    'input-1': {
      type: 'Input',
      props: {
        label: 'Name',
        valuePath: 'user.name',
        placeholder: 'Enter your name',
      },
    },
    'button-1': {
      type: 'Button',
      props: { label: 'Submit', theme: 'primary', action: 'submit' },
    },
  },
}

const data = {
  user: { name: '' },
}

const actionConfig = {
  handlers: {
    submit: async () => {
      console.log('submit')
    },
  },
}
</script>

<template>
  <Renderer
    :spec="spec"
    :registry="tdesignRegistry"
    :data="data"
    :action-config="actionConfig"
  />
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
interface Spec {
  root: string
  elements: Record<string, UIElement>
}

interface UIElement {
  type: string
  props?: Record<string, unknown>
  children?: string[]
  visible?: VisibilityCondition
  on?: Record<string, ActionBinding | ActionBinding[]>
  repeat?: { path: string; key?: string }
}
```

### Data Binding

Use `props.valuePath` to bind component values (for example in Input):

```js
const spec = {
  root: 'input-1',
  elements: {
    'input-1': {
      type: 'Input',
      props: {
        valuePath: 'form.email',
      },
    },
  },
}
```

| Syntax | Example | Description |
|--------|---------|-------------|
| Dot notation | `user.name` | Access nested properties |
| Array index | `items[0].id` | Access array elements |
| Bracket notation | `data["key"]` | Access with string keys |
| JSON Pointer | `/user/name` | Pointer-style path syntax |

---

## 🔧 API

### Composables

```ts
import {
  useActions,
  useData,
  useDataBinding,
  useDataContext,
  useDataValue,
  useIsVisible,
  useValidation,
} from 'json-render-vue'
```

| Composable | Description |
|------------|-------------|
| `useData()` | Access shared data store (Ref) |
| `useDataContext()` | Read/write data with get/set/update |
| `useDataBinding(path)` | Two-way binding (WritableComputedRef) |
| `useDataValue(path)` | Read-only computed value |
| `useActions()` | Action handling system |
| `useValidation()` | Form validation utilities |
| `useIsVisible(condition)` | Conditional visibility |

### Example

```ts
// In component setup
const data = useData()
const dataCtx = useDataContext()

// Two-way binding
const name = useDataBinding('user.name')
name.value = 'John' // Updates data.value.user.name

// Read-only
const email = useDataValue('user.email')

// Programmatic update
dataCtx.set('user.role', 'admin')
```

---

## 🧩 Component Registry

Create custom registries by mapping type names to Vue components:

```ts
import { Button, Card, Input } from 'your-ui-library'

const customRegistry: Record<string, Component> = {
  Card,
  Button,
  Input,
}
```

### TDesign Bindings

Pre-built registry for [TDesign Vue Next](https://tdesign.tencent.com/vue-next/):

```ts
import { tdesignRegistry } from '@zwkang-dev/json-render-tdesign-vue-next'

// Available: Card, Button, Input
```

---

## 📦 Packages

| Package | Description | Status |
|---------|-------------|--------|
| [`json-render-vue`](https://www.npmjs.com/package/json-render-vue) | Core Vue 3 rendering framework | ✅ Stable |
| [`@zwkang-dev/json-render-tdesign-vue-next`](https://www.npmjs.com/package/@zwkang-dev/json-render-tdesign-vue-next) | TDesign Vue Next bindings | 🚧 Beta |

---

## 📋 Changelog

See [GitHub Releases](https://github.com/ZWkang/json-render-vue/releases) for the changelog.

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

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to:
- Run `pnpm test` before submitting
- Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- Update documentation if needed

---

## 📄 License

[MIT](./LICENSE) © [zwkang](https://github.com/ZWkang)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/ZWkang">zwkang</a>
</p>
