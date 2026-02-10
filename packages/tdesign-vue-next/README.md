# @zwkang-dev/json-render-tdesign-vue-next

TDesign Vue Next components for the json-render-vue framework.

## Installation

```bash
pnpm add @zwkang-dev/json-render-tdesign-vue-next tdesign-vue-next
```

## Usage

```vue
<script setup lang="ts">
import { Renderer } from 'json-render-vue'
import { tdesignRegistry } from '@zwkang-dev/json-render-tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'

const spec = {
  root: 'card-1',
  elements: {
    'card-1': {
      type: 'Card',
      props: {
        title: 'Welcome',
        subtitle: 'TDesign Vue Next with json-render',
      },
      children: ['button-1', 'input-1'],
    },
    'button-1': {
      type: 'Button',
      props: {
        label: 'Click Me',
        theme: 'primary',
        action: 'handleClick',
      },
    },
    'input-1': {
      type: 'Input',
      props: {
        label: 'Username',
        valuePath: 'username',
        placeholder: 'Enter your username',
      },
    },
  },
}

const actionConfig = {
  handlers: {
    handleClick: async () => {
      console.log('Button clicked!')
    },
  },
}
</script>

<template>
  <Renderer
    :spec="spec"
    :registry="tdesignRegistry"
    :data="{ username: '' }"
    :action-config="actionConfig"
  />
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
import { generateCatalogPrompt } from '@json-render/core'
import { tdesignCatalog } from '@zwkang-dev/json-render-tdesign-vue-next'

const prompt = generateCatalogPrompt(tdesignCatalog)
console.log(prompt)
```

## LICENSE

[MIT](./LICENSE) License © 2022 [zwkang](https://github.com/zwkang)
