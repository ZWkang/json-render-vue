import { describe, expect, it } from 'vitest'
import { defineComponent, h, markRaw } from 'vue'
import { mount } from '@vue/test-utils'
import { ElementRenderer, JSONUIProvider, Renderer, useActions, useData, useDataBinding } from '../src'

describe('json-render-vue exports', () => {
  it('exports Renderer component', () => {
    expect(Renderer).toBeDefined()
  })

  it('exports JSONUIProvider component', () => {
    expect(JSONUIProvider).toBeDefined()
  })

  it('exports ElementRenderer component', () => {
    expect(ElementRenderer).toBeDefined()
  })

  it('exports useData composable', () => {
    expect(useData).toBeDefined()
    expect(typeof useData).toBe('function')
  })

  it('exports useActions composable', () => {
    expect(useActions).toBeDefined()
    expect(typeof useActions).toBe('function')
  })

  it('exports useDataBinding composable', () => {
    expect(useDataBinding).toBeDefined()
    expect(typeof useDataBinding).toBe('function')
  })
})

describe('renderer component', () => {
  it('renders a simple spec', () => {
    const TextComponent = markRaw(defineComponent({
      props: ['element'],
      setup(props) {
        return () => h('span', {}, props.element?.props?.content || '')
      },
    }))

    const registry = { Text: TextComponent }
    const spec = { type: 'Text', props: { content: 'Hello World' } }

    const wrapper = mount(Renderer, {
      props: { spec, registry },
    })

    expect(wrapper.text()).toContain('Hello World')
  })

  it('renders nested children', () => {
    const Card = markRaw(defineComponent({
      props: ['element'],
      setup(_, { slots }) {
        return () => h('div', { class: 'card' }, slots.default?.())
      },
    }))

    const Text = markRaw(defineComponent({
      props: ['element'],
      setup(props) {
        return () => h('span', {}, props.element?.props?.content || '')
      },
    }))

    const registry = { Card, Text }
    const spec = {
      type: 'Card',
      children: [
        { type: 'Text', props: { content: 'Child 1' } },
        { type: 'Text', props: { content: 'Child 2' } },
      ],
    }

    const wrapper = mount(Renderer, {
      props: { spec, registry },
    })

    expect(wrapper.text()).toContain('Child 1')
    expect(wrapper.text()).toContain('Child 2')
  })

  it('uses fallback for unknown types', () => {
    const Fallback = markRaw(defineComponent({
      props: ['element'],
      setup(props) {
        return () => h('div', { class: 'fallback' }, `Unknown: ${props.element?.type}`)
      },
    }))

    const registry = {}
    const spec = { type: 'UnknownComponent' }

    const wrapper = mount(Renderer, {
      props: { spec, registry, fallback: Fallback },
    })

    expect(wrapper.text()).toContain('Unknown: UnknownComponent')
  })
})
