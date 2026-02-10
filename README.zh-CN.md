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
  <strong>json-render 框架的 Vue 3 实现</strong><br>
  <sub>一个强大的 JSON 驱动 UI 渲染系统</sub>
</p>

<p align="center">
  <a href="#-安装">安装</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-核心概念">核心概念</a> •
  <a href="#-api">API</a> •
  <a href="#-包列表">包列表</a> •
  <a href="./README.md">English</a>
</p>

---

## ✨ 特性

- 🚀 **JSON 驱动** - 使用 JSON 定义 UI 结构，用 Vue 渲染
- 🔗 **双向绑定** - 通过路径语法自动数据绑定
- 🧩 **可插拔** - 自由接入你的组件库
- 📦 **支持 Tree Shaking** - 按需打包
- 🎯 **TypeScript** - 开箱即用的完整类型支持

---

## 📦 安装

```bash
# 核心包
pnpm add json-render-vue

# TDesign 组件绑定（可选）
pnpm add @zwkang-dev/json-render-tdesign-vue-next
```

---

## 🚀 快速开始

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
        label: '姓名',
        valuePath: 'user.name',
        placeholder: '请输入你的名字',
      },
    },
    'button-1': {
      type: 'Button',
      props: { label: '提交', theme: 'primary', action: 'submit' },
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

## 📖 核心概念

### Renderer

> 顶层组件，整合了 `JSONUIProvider` 和 `ElementRenderer`

```vue
<Renderer
  :spec="spec"
  :registry="registry"
  :data="initialData"
  :action-config="actionConfig"
/>
```

### JSON Spec 结构

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

### 数据绑定

通过组件的 `props.valuePath` 指定双向绑定路径（例如 Input 组件）：

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

| 语法 | 示例 | 描述 |
|------|------|------|
| 点号表示法 | `user.name` | 访问嵌套属性 |
| 数组索引 | `items[0].id` | 访问数组元素 |
| 方括号表示法 | `data["key"]` | 使用字符串键访问 |
| JSON Pointer | `/user/name` | 指针路径表示法 |

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

| Composable | 描述 |
|------------|------|
| `useData()` | 访问共享数据存储（Ref） |
| `useDataContext()` | 使用 get/set/update 读写数据 |
| `useDataBinding(path)` | 双向绑定（WritableComputedRef） |
| `useDataValue(path)` | 只读计算值 |
| `useActions()` | Action 处理系统 |
| `useValidation()` | 表单验证工具 |
| `useIsVisible(condition)` | 条件可见性 |

### 示例

```ts
// 在组件 setup 中
const data = useData()
const dataCtx = useDataContext()

// 双向绑定
const name = useDataBinding('user.name')
name.value = 'John' // 更新 data.value.user.name

// 只读
const email = useDataValue('user.email')

// 编程式更新
dataCtx.set('user.role', 'admin')
```

---

## 🧩 组件注册表

通过将类型名称映射到 Vue 组件来创建自定义注册表：

```ts
import { Button, Card, Input } from 'your-ui-library'

const customRegistry: Record<string, Component> = {
  Card,
  Button,
  Input,
}
```

### TDesign 绑定

为 [TDesign Vue Next](https://tdesign.tencent.com/vue-next/) 预构建的注册表：

```ts
import { tdesignRegistry } from '@zwkang-dev/json-render-tdesign-vue-next'

// 可用组件：Card, Button, Input
```

---

## 📦 包列表

| 包 | 描述 | 状态 |
|---|------|------|
| [`json-render-vue`](https://www.npmjs.com/package/json-render-vue) | 核心 Vue 3 渲染框架 | ✅ 稳定 |
| [`@zwkang-dev/json-render-tdesign-vue-next`](https://www.npmjs.com/package/@zwkang-dev/json-render-tdesign-vue-next) | TDesign Vue Next 绑定 | 🚧 Beta |

---

## 📋 更新日志

查看 [GitHub Releases](https://github.com/ZWkang/json-render-vue/releases) 获取更新日志。

---

## 🛠 开发

```bash
pnpm install          # 安装依赖
pnpm build            # 构建所有包
pnpm test             # 运行测试
pnpm lint             # 代码检查
pnpm typecheck        # TypeScript 类型检查
```

---

## 🤝 贡献

欢迎贡献！请按照以下步骤操作：

1. Fork 本仓库
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 发起 Pull Request

请确保：
- 提交前运行 `pnpm test`
- 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范编写提交信息
- 如有需要，更新文档

---

## 📄 许可证

[MIT](./LICENSE) © [zwkang](https://github.com/ZWkang)

---

<p align="center">
  <sub>用 ❤️ 为 Vue 生态系统构建</sub>
</p>
