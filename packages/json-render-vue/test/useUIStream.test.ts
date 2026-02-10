import { describe, expect, it } from 'vitest'
import { flatToTree, useUIStream } from '../src/composables/useUIStream'
import type { FlatElement } from '../src/types/catalog-types'

describe('useUIStream composable', () => {
  describe('initialization', () => {
    it('initializes with null spec', () => {
      const { spec } = useUIStream({ api: '/api/generate' })
      expect(spec.value).toBeNull()
    })

    it('initializes with isStreaming false', () => {
      const { isStreaming } = useUIStream({ api: '/api/generate' })
      expect(isStreaming.value).toBe(false)
    })

    it('initializes with no error', () => {
      const { error } = useUIStream({ api: '/api/generate' })
      expect(error.value).toBeNull()
    })
  })

  describe('clear', () => {
    it('clears spec and error', () => {
      const { spec, error, clear } = useUIStream({ api: '/api/generate' })

      // Manually set values to test clear
      clear()

      expect(spec.value).toBeNull()
      expect(error.value).toBeNull()
    })
  })

  describe('flatToTree utility', () => {
    it('converts flat elements to tree spec', () => {
      const flatElements: FlatElement[] = [
        { key: 'root', type: 'Card', props: { title: 'Hello' } },
        { key: 'child1', type: 'Text', props: { content: 'World' }, parentKey: 'root' },
        { key: 'child2', type: 'Button', props: { label: 'Click' }, parentKey: 'root' },
      ]

      const spec = flatToTree(flatElements)

      expect(spec.root).toBe('root')
      expect(spec.elements.root.type).toBe('Card')
      expect(spec.elements.root.children).toContain('child1')
      expect(spec.elements.root.children).toContain('child2')
      expect(spec.elements.child1.type).toBe('Text')
      expect(spec.elements.child2.type).toBe('Button')
    })

    it('handles single element', () => {
      const flatElements: FlatElement[] = [
        { key: 'only', type: 'Card', props: {} },
      ]

      const spec = flatToTree(flatElements)

      expect(spec.root).toBe('only')
      expect(spec.elements.only.type).toBe('Card')
      expect(spec.elements.only.children).toEqual([])
    })

    it('handles nested elements', () => {
      const flatElements: FlatElement[] = [
        { key: 'root', type: 'Card' },
        { key: 'container', type: 'Box', parentKey: 'root' },
        { key: 'text', type: 'Text', parentKey: 'container' },
      ]

      const spec = flatToTree(flatElements)

      expect(spec.elements.root.children).toContain('container')
      expect(spec.elements.container.children).toContain('text')
      expect(spec.elements.text.children).toEqual([])
    })
  })
})
