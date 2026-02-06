import { createCatalog } from '@json-render/core'
import { z } from 'zod'

/**
 * TDesign Vue Next catalog for json-render
 */
export const tdesignCatalog = createCatalog({
  name: 'tdesign-vue-next',
  components: {
    // Layout Components
    Card: {
      props: z.object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        bordered: z.boolean().optional(),
        shadow: z.boolean().optional(),
        hoverable: z.boolean().optional(),
      }),
      hasChildren: true,
      description: 'Card container component',
    },

    Space: {
      props: z.object({
        direction: z.enum(['horizontal', 'vertical']).optional(),
        size: z.union([z.enum(['small', 'medium', 'large']), z.number()]).optional(),
        align: z.enum(['start', 'end', 'center', 'baseline']).optional(),
      }),
      hasChildren: true,
      description: 'Space layout component',
    },

    Divider: {
      props: z.object({
        dashed: z.boolean().optional(),
        content: z.string().optional(),
        align: z.enum(['left', 'center', 'right']).optional(),
      }),
      hasChildren: false,
      description: 'Divider component',
    },

    // Typography
    Text: {
      props: z.object({
        content: z.string(),
        type: z.enum(['default', 'primary', 'success', 'warning', 'error']).optional(),
        strong: z.boolean().optional(),
        disabled: z.boolean().optional(),
        mark: z.boolean().optional(),
        code: z.boolean().optional(),
        delete: z.boolean().optional(),
        underline: z.boolean().optional(),
      }),
      hasChildren: false,
      description: 'Text component',
    },

    // Form Components
    Button: {
      props: z.object({
        label: z.string(),
        theme: z.enum(['default', 'primary', 'success', 'warning', 'danger']).optional(),
        variant: z.enum(['base', 'outline', 'dashed', 'text']).optional(),
        size: z.enum(['small', 'medium', 'large']).optional(),
        disabled: z.boolean().optional(),
        loading: z.boolean().optional(),
        block: z.boolean().optional(),
        icon: z.string().optional(),
        action: z.string().optional(),
      }),
      hasChildren: false,
      description: 'Button component',
    },

    Input: {
      props: z.object({
        label: z.string().optional(),
        valuePath: z.string(),
        placeholder: z.string().optional(),
        type: z.enum(['text', 'password', 'number']).optional(),
        disabled: z.boolean().optional(),
        clearable: z.boolean().optional(),
        maxlength: z.number().optional(),
        showWordLimit: z.boolean().optional(),
      }),
      hasChildren: false,
      description: 'Input component',
    },

    Textarea: {
      props: z.object({
        label: z.string().optional(),
        valuePath: z.string(),
        placeholder: z.string().optional(),
        disabled: z.boolean().optional(),
        maxlength: z.number().optional(),
        showWordLimit: z.boolean().optional(),
        autosize: z.boolean().optional(),
      }),
      hasChildren: false,
      description: 'Textarea component',
    },

    Select: {
      props: z.object({
        label: z.string().optional(),
        valuePath: z.string(),
        options: z.array(z.object({
          label: z.string(),
          value: z.union([z.string(), z.number()]),
        })),
        placeholder: z.string().optional(),
        disabled: z.boolean().optional(),
        clearable: z.boolean().optional(),
        multiple: z.boolean().optional(),
      }),
      hasChildren: false,
      description: 'Select component',
    },

    // Data Display
    Table: {
      props: z.object({
        dataPath: z.string(),
        columns: z.array(z.object({
          title: z.string(),
          colKey: z.string(),
          width: z.union([z.string(), z.number()]).optional(),
          align: z.enum(['left', 'center', 'right']).optional(),
        })),
        bordered: z.boolean().optional(),
        hover: z.boolean().optional(),
        stripe: z.boolean().optional(),
        size: z.enum(['small', 'medium', 'large']).optional(),
      }),
      hasChildren: false,
      description: 'Table component',
    },

    Tag: {
      props: z.object({
        content: z.string(),
        theme: z.enum(['default', 'primary', 'success', 'warning', 'danger']).optional(),
        variant: z.enum(['dark', 'light', 'outline', 'light-outline']).optional(),
        size: z.enum(['small', 'medium', 'large']).optional(),
        closable: z.boolean().optional(),
      }),
      hasChildren: false,
      description: 'Tag component',
    },

    // Feedback
    Alert: {
      props: z.object({
        message: z.string(),
        theme: z.enum(['info', 'success', 'warning', 'error']).optional(),
        title: z.string().optional(),
        closable: z.boolean().optional(),
      }),
      hasChildren: false,
      description: 'Alert component',
    },

    Loading: {
      props: z.object({
        loading: z.boolean(),
        text: z.string().optional(),
        size: z.enum(['small', 'medium', 'large']).optional(),
      }),
      hasChildren: true,
      description: 'Loading component',
    },
  },
  actions: {
    submit: { description: 'Submit form data' },
    reset: { description: 'Reset form' },
    navigate: { description: 'Navigate to another page' },
    refresh: { description: 'Refresh data' },
  },
  validation: 'strict',
})

export type TDesignCatalog = typeof tdesignCatalog
