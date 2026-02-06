# @json-render/tdesign-vue-next

TDesign Vue Next components for json-render-vue framework.

## Installation

```bash
pnpm add @json-render/tdesign-vue-next tdesign-vue-next
```

## Usage

```vue
<script setup lang="ts">
import { Renderer, JSONUIProvider } from 'json-render-vue'
import { tdesignRegistry, tdesignCatalog } from '@json-render/tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'

const tree = {
  root: 'card-1',
  elements: {
    'card-1': {
      key: 'card-1',
      type: 'Card',
      props: {
        title: 'Welcome',
        subtitle: 'TDesign Vue Next with json-render',
      },
      children: ['button-1', 'input-1'],
    },
    'button-1': {
      key: 'button-1',
      type: 'Button',
      props: {
        label: 'Click Me',
        theme: 'primary',
        action: 'handleClick',
      },
      children: [],
    },
    'input-1': {
      key: 'input-1',
      type: 'Input',
      props: {
        label: 'Username',
        valuePath: '/username',
        placeholder: 'Enter your username',
      },
      children: [],
    },
  },
}

const actionHandlers = {
  handleClick: async () => {
    console.log('Button clicked!')
  },
}
</script>

<template>
  <JSONUIProvider
    :initial-data="{ username: '' }"
    :action-handlers="actionHandlers"
  >
    <Renderer :tree="tree" :registry="tdesignRegistry" />
  </JSONUIProvider>
</template>
```

## Available Components

### Layout
- **Card**: Container with title and subtitle
- **Space**: Flex layout with spacing
- **Divider**: Visual separator

### Typography
- **Text**: Text with various styles

### Form
- **Button**: Interactive button with actions
- **Input**: Text input with data binding
- **Textarea**: Multi-line text input
- **Select**: Dropdown selection

### Data Display
- **Table**: Data table with columns
- **Tag**: Label tag

### Feedback
- **Alert**: Alert message
- **Loading**: Loading indicator

## Catalog

Use the `tdesignCatalog` to generate AI prompts:

```typescript
import { generateCatalogPrompt } from 'json-render-vue'
import { tdesignCatalog } from '@json-render/tdesign-vue-next'

const prompt = generateCatalogPrompt(tdesignCatalog)
console.log(prompt)
```

## LICENSE

[MIT](./LICENSE) License © 2022 [zwkang](https://github.com/zwkang)

