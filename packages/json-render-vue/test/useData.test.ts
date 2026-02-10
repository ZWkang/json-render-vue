import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { provideData, useData, useDataBinding, useDataValue } from '../src/composables/useData'

// Helper to create a component that uses provide/inject
function createProviderComponent(initialData: Record<string, any>, childSetup: () => any) {
  return defineComponent({
    setup() {
      provideData(initialData)
      return () => h(defineComponent({
        setup: childSetup,
        render: () => null,
      }))
    },
  })
}

describe('useData composable', () => {
  describe('provideData and useData', () => {
    it('provides and injects data store', () => {
      let injectedData: any

      const TestComponent = createProviderComponent(
        { name: 'John' },
        () => {
          injectedData = useData()
          return {}
        },
      )

      mount(TestComponent)
      expect(injectedData.value).toEqual({ name: 'John' })
    })

    it('throws when useData called without provider', () => {
      const TestComponent = defineComponent({
        setup() {
          expect(() => useData()).toThrow('useData() was called but no data store was provided')
          return () => null
        },
      })

      mount(TestComponent)
    })
  })

  describe('useDataValue', () => {
    it('returns computed value for simple path', () => {
      let nameValue: any

      const TestComponent = createProviderComponent(
        { user: { name: 'Alice' } },
        () => {
          nameValue = useDataValue('user.name')
          return {}
        },
      )

      mount(TestComponent)
      expect(nameValue.value).toBe('Alice')
    })

    it('returns computed value for array index', () => {
      let itemValue: any

      const TestComponent = createProviderComponent(
        { items: ['apple', 'banana', 'cherry'] },
        () => {
          itemValue = useDataValue('items[1]')
          return {}
        },
      )

      mount(TestComponent)
      expect(itemValue.value).toBe('banana')
    })

    it('supports JSON Pointer paths', () => {
      let nameValue: any

      const TestComponent = createProviderComponent(
        { user: { name: 'Alice' } },
        () => {
          nameValue = useDataValue('/user/name')
          return {}
        },
      )

      mount(TestComponent)
      expect(nameValue.value).toBe('Alice')
    })

    it('returns undefined for non-existent path', () => {
      let value: any

      const TestComponent = createProviderComponent(
        { user: {} },
        () => {
          value = useDataValue('user.address.city')
          return {}
        },
      )

      mount(TestComponent)
      expect(value.value).toBeUndefined()
    })
  })

  describe('useDataBinding', () => {
    it('returns writable computed ref', () => {
      let binding: any

      const TestComponent = createProviderComponent(
        { form: { email: 'test@example.com' } },
        () => {
          binding = useDataBinding('form.email')
          return {}
        },
      )

      mount(TestComponent)

      expect(binding.value).toBe('test@example.com')
    })

    it('setter updates the data store', async () => {
      let binding: any
      let dataStore: any

      const TestComponent = createProviderComponent(
        { count: 0 },
        () => {
          dataStore = useData()
          binding = useDataBinding('count')
          return {}
        },
      )

      mount(TestComponent)

      expect(binding.value).toBe(0)
      binding.value = 42
      await nextTick()
      expect(dataStore.value.count).toBe(42)
    })

    it('creates intermediate objects for nested paths', async () => {
      let dataStore: any
      let binding: any

      const TestComponent = createProviderComponent(
        {},
        () => {
          dataStore = useData()
          binding = useDataBinding('deeply.nested.value')
          return {}
        },
      )

      mount(TestComponent)

      binding.value = 'created'
      await nextTick()
      expect(dataStore.value.deeply.nested.value).toBe('created')
    })

    it('writes using JSON Pointer paths', async () => {
      let dataStore: any
      let binding: any

      const TestComponent = createProviderComponent(
        {},
        () => {
          dataStore = useData()
          binding = useDataBinding('/deeply/nested/value')
          return {}
        },
      )

      mount(TestComponent)

      binding.value = 'created'
      await nextTick()
      expect(dataStore.value.deeply.nested.value).toBe('created')
    })
  })
})
