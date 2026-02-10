import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { provideData } from '../src/composables/useData'
import { provideValidation, useValidation, useValidationError } from '../src/composables/useValidation'

function createValidationTestComponent(data: Record<string, unknown>, childSetup: () => unknown) {
  return defineComponent({
    setup() {
      const dataCtx = provideData({ initialState: data })
      provideValidation(dataCtx.state)
      return () => h(defineComponent({
        setup: childSetup,
        render: () => null,
      }))
    },
  })
}

describe('useValidation composable', () => {
  describe('provideValidation and useValidation', () => {
    it('provides and injects validation context', () => {
      let ctx: ReturnType<typeof useValidation> | undefined

      const TestComponent = createValidationTestComponent(
        {},
        () => {
          ctx = useValidation()
          return {}
        },
      )

      mount(TestComponent)
      expect(ctx).toBeDefined()
      expect(ctx!.register).toBeDefined()
      expect(ctx!.validateAll).toBeDefined()
      expect(ctx!.clearErrors).toBeDefined()
    })

    it('throws when useValidation called without provider', () => {
      const TestComponent = defineComponent({
        setup() {
          expect(() => useValidation()).toThrow('useValidation() was called but no validation context was provided')
          return () => null
        },
      })

      mount(TestComponent)
    })
  })

  describe('register and validateAll', () => {
    it('registers validator and runs on validateAll', () => {
      let ctx: ReturnType<typeof useValidation> | undefined

      const TestComponent = createValidationTestComponent(
        { name: '' },
        () => {
          ctx = useValidation()
          ctx.register('name', (value: unknown) => value ? null : 'Name is required')
          return {}
        },
      )

      mount(TestComponent)
      const isValid = ctx!.validateAll()

      expect(isValid).toBe(false)
      expect(ctx!.errors.value.name).toBe('Name is required')
    })

    it('returns true when all validations pass', () => {
      let ctx: ReturnType<typeof useValidation> | undefined

      const TestComponent = createValidationTestComponent(
        { name: 'John', email: 'john@example.com' },
        () => {
          ctx = useValidation()
          ctx.register('name', (value: unknown) => value ? null : 'Required')
          ctx.register('email', (value: unknown) => String(value).includes('@') ? null : 'Invalid email')
          return {}
        },
      )

      mount(TestComponent)
      const isValid = ctx!.validateAll()

      expect(isValid).toBe(true)
      expect(ctx!.errors.value.name).toBeNull()
      expect(ctx!.errors.value.email).toBeNull()
    })

    it('unregister function removes validator', () => {
      let ctx: ReturnType<typeof useValidation> | undefined
      let unregister: (() => void) | undefined

      const TestComponent = createValidationTestComponent(
        { name: '' },
        () => {
          ctx = useValidation()
          unregister = ctx.register('name', () => 'Error')
          return {}
        },
      )

      mount(TestComponent)
      unregister!()
      const isValid = ctx!.validateAll()

      expect(isValid).toBe(true)
      expect(ctx!.errors.value.name).toBeUndefined()
    })
  })

  describe('clearErrors', () => {
    it('clears all errors', () => {
      let ctx: ReturnType<typeof useValidation> | undefined

      const TestComponent = createValidationTestComponent(
        { name: '' },
        () => {
          ctx = useValidation()
          ctx.register('name', () => 'Error')
          return {}
        },
      )

      mount(TestComponent)
      ctx!.validateAll()
      expect(ctx!.errors.value.name).toBe('Error')

      ctx!.clearErrors()
      expect(ctx!.errors.value).toEqual({})
    })
  })

  describe('useValidationError', () => {
    it('returns computed error for specific path', () => {
      let error: ReturnType<typeof useValidationError> | undefined

      const TestComponent = createValidationTestComponent(
        { email: 'invalid' },
        () => {
          const ctx = useValidation()
          ctx.register('email', (v: unknown) => String(v).includes('@') ? null : 'Invalid email')
          error = useValidationError('email')
          ctx.validateAll()
          return {}
        },
      )

      mount(TestComponent)
      expect(error!.value).toBe('Invalid email')
    })

    it('returns null for paths without errors', () => {
      let error: ReturnType<typeof useValidationError> | undefined

      const TestComponent = createValidationTestComponent(
        { email: 'test@example.com' },
        () => {
          const ctx = useValidation()
          ctx.register('email', (v: unknown) => String(v).includes('@') ? null : 'Invalid')
          error = useValidationError('email')
          ctx.validateAll()
          return {}
        },
      )

      mount(TestComponent)
      expect(error!.value).toBeNull()
    })
  })
})
