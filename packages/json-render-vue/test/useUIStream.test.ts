import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useUIStream } from '../src/composables/useUIStream'

describe('useUIStream composable', () => {
  describe('initialization', () => {
    it('initializes with null spec', () => {
      const { spec } = useUIStream(null)
      expect(spec.value).toBeNull()
    })

    it('initializes with provided spec', () => {
      const initialSpec = { type: 'Card', props: { title: 'Hello' } }
      const { spec } = useUIStream(initialSpec)
      expect(spec.value).toEqual(initialSpec)
    })
  })

  describe('update', () => {
    it('replaces spec when receiving full spec with type', async () => {
      const { spec, update } = useUIStream({ type: 'Card', props: {} })

      update({ type: 'Button', props: { label: 'Click' } })
      await nextTick()

      expect(spec.value?.type).toBe('Button')
      expect(spec.value?.props?.label).toBe('Click')
    })

    it('sets spec to null when receiving null', async () => {
      const { spec, update } = useUIStream({ type: 'Card' })

      update(null)
      await nextTick()

      expect(spec.value).toBeNull()
    })

    it('merges partial update without type', async () => {
      const { spec, update } = useUIStream({ type: 'Card', props: { title: 'Old' } })

      update({ props: { title: 'New', subtitle: 'Added' } })
      await nextTick()

      expect(spec.value?.type).toBe('Card')
      expect(spec.value?.props?.title).toBe('New')
      expect(spec.value?.props?.subtitle).toBe('Added')
    })
  })

  describe('abort', () => {
    it('provides abort function', () => {
      const { abort } = useUIStream(null)
      expect(typeof abort).toBe('function')
    })

    it('abort creates new controller', () => {
      const { abort } = useUIStream(null)

      // Should not throw
      abort()
      abort()
    })
  })

  describe('spec structure', () => {
    it('supports children array', () => {
      const { spec } = useUIStream({
        type: 'Card',
        children: [
          { type: 'Text', props: { content: 'Hello' } },
          { type: 'Button', props: { label: 'Click' } },
        ],
      })

      expect(Array.isArray(spec.value?.children)).toBe(true)
      expect((spec.value?.children as any[])?.[0]?.type).toBe('Text')
    })

    it('supports string children', () => {
      const { spec } = useUIStream({
        type: 'Text',
        children: 'Hello World',
      })

      expect(spec.value?.children).toBe('Hello World')
    })
  })
})
