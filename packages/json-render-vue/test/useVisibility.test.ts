import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { provideData } from '../src/composables/useData'
import { useIsVisible } from '../src/composables/useVisibility'

function createVisibilityTestComponent(data: Record<string, any>, condition: any, callback: (visible: any) => void) {
  return defineComponent({
    setup() {
      provideData(data)
      return () => h(defineComponent({
        setup() {
          const visible = useIsVisible(condition)
          callback(visible)
          return () => null
        },
      }))
    },
  })
}

describe('useVisibility composable', () => {
  describe('useIsVisible', () => {
    it('returns true for undefined condition', () => {
      let result: any

      const TestComponent = createVisibilityTestComponent(
        {},
        undefined,
        (v) => { result = v },
      )

      mount(TestComponent)
      expect(result.value).toBe(true)
    })

    it('returns true for null condition', () => {
      let result: any

      const TestComponent = createVisibilityTestComponent(
        {},
        null,
        (v) => { result = v },
      )

      mount(TestComponent)
      expect(result.value).toBe(true)
    })

    it('returns boolean condition directly', () => {
      let result: any

      const TestComponent = createVisibilityTestComponent(
        {},
        false,
        (v) => { result = v },
      )

      mount(TestComponent)
      expect(result.value).toBe(false)
    })

    it('evaluates eq condition against data', () => {
      let result: any

      const TestComponent = createVisibilityTestComponent(
        { status: 'active' },
        { path: 'status', value: 'active', operator: 'eq' },
        (v) => { result = v },
      )

      mount(TestComponent)
      expect(result.value).toBe(true)
    })

    it('evaluates neq condition against data', () => {
      let result: any

      const TestComponent = createVisibilityTestComponent(
        { status: 'inactive' },
        { path: 'status', value: 'active', operator: 'neq' },
        (v) => { result = v },
      )

      mount(TestComponent)
      expect(result.value).toBe(true)
    })

    it('evaluates gt condition', () => {
      let result: any

      const TestComponent = createVisibilityTestComponent(
        { count: 10 },
        { path: 'count', value: 5, operator: 'gt' },
        (v) => { result = v },
      )

      mount(TestComponent)
      expect(result.value).toBe(true)
    })

    it('evaluates in condition with array', () => {
      let result: any

      const TestComponent = createVisibilityTestComponent(
        { role: 'admin' },
        { path: 'role', value: ['admin', 'superuser'], operator: 'in' },
        (v) => { result = v },
      )

      mount(TestComponent)
      expect(result.value).toBe(true)
    })

    it('evaluates contains condition', () => {
      let result: any

      const TestComponent = createVisibilityTestComponent(
        { tags: ['vue', 'react', 'angular'] },
        { path: 'tags', value: 'vue', operator: 'contains' },
        (v) => { result = v },
      )

      mount(TestComponent)
      expect(result.value).toBe(true)
    })

    it('uses ref condition reactively', () => {
      let result: any
      const conditionRef = ref(true)

      const TestComponent = defineComponent({
        setup() {
          provideData({})
          return () => h(defineComponent({
            setup() {
              result = useIsVisible(conditionRef)
              return () => null
            },
          }))
        },
      })

      mount(TestComponent)
      expect(result.value).toBe(true)

      conditionRef.value = false
      expect(result.value).toBe(false)
    })
  })
})
