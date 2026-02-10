import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { provideData } from '../src/composables/useData'
import { provideActions, useActions } from '../src/composables/useActions'

function createActionsProvider(config: any, childSetup: () => any) {
  return defineComponent({
    setup() {
      // Actions need data context
      provideData({ initialState: {} })
      provideActions(config)
      return () => h(defineComponent({
        setup: childSetup,
        render: () => null,
      }))
    },
  })
}

describe('useActions composable', () => {
  describe('provideActions and useActions', () => {
    it('provides and injects actions context', () => {
      let ctx: any

      const TestComponent = createActionsProvider(
        {},
        () => {
          ctx = useActions()
          return {}
        },
      )

      mount(TestComponent)
      expect(ctx).toBeDefined()
      expect(ctx.execute).toBeDefined()
      expect(ctx.confirm).toBeDefined()
      expect(ctx.cancel).toBeDefined()
    })

    it('throws when useActions called without provider', () => {
      const TestComponent = defineComponent({
        setup() {
          expect(() => useActions()).toThrow('useActions() was called but no actions context was provided')
          return () => null
        },
      })

      mount(TestComponent)
    })
  })

  describe('execute action', () => {
    it('calls onAction callback', async () => {
      const onAction = vi.fn()
      let ctx: any

      const TestComponent = createActionsProvider(
        { onAction },
        () => {
          ctx = useActions()
          return {}
        },
      )

      mount(TestComponent)
      await ctx.execute({ action: 'submit' })

      expect(onAction).toHaveBeenCalledWith({ action: 'submit' })
    })

    it('tracks loading state during execution', async () => {
      let resolveAction: () => void
      const onAction = vi.fn(() => new Promise<void>((resolve) => {
        resolveAction = resolve
      }))
      let ctx: any

      const TestComponent = createActionsProvider(
        { onAction },
        () => {
          ctx = useActions()
          return {}
        },
      )

      mount(TestComponent)

      const executePromise = ctx.execute({ action: 'submit' })
      await nextTick()

      expect(ctx.loadingActions.value.has('submit')).toBe(true)

      resolveAction!()
      await executePromise
      await nextTick()

      expect(ctx.loadingActions.value.has('submit')).toBe(false)
    })
  })

  describe('confirmation flow', () => {
    it('sets pendingConfirmation for action with confirm', async () => {
      let ctx: any

      const TestComponent = createActionsProvider(
        {},
        () => {
          ctx = useActions()
          return {}
        },
      )

      mount(TestComponent)
      // Don't await - confirmation pauses execution
      ctx.execute({ action: 'delete', confirm: { title: 'Confirm', message: 'Are you sure?' } })
      await nextTick()

      expect(ctx.pendingConfirmation.value).not.toBeNull()
      expect(ctx.pendingConfirmation.value.action.action).toBe('delete')
    })

    it('confirm() executes pending action and clears it', async () => {
      const onAction = vi.fn()
      let ctx: any

      const TestComponent = createActionsProvider(
        { onAction },
        () => {
          ctx = useActions()
          return {}
        },
      )

      mount(TestComponent)
      ctx.execute({ action: 'delete', confirm: { title: 'Confirm', message: 'Sure?' } })
      await nextTick()

      expect(ctx.pendingConfirmation.value).not.toBeNull()
      expect(onAction).not.toHaveBeenCalled()

      ctx.confirm()
      await nextTick()

      expect(onAction).toHaveBeenCalled()
      expect(ctx.pendingConfirmation.value).toBeNull()
    })

    it('cancel() clears pending action without executing', async () => {
      const onAction = vi.fn()
      let ctx: any

      const TestComponent = createActionsProvider(
        { onAction },
        () => {
          ctx = useActions()
          return {}
        },
      )

      mount(TestComponent)
      ctx.execute({ action: 'delete', confirm: { title: 'Confirm', message: 'Sure?' } })
      await nextTick()

      ctx.cancel()
      await nextTick()

      expect(onAction).not.toHaveBeenCalled()
      expect(ctx.pendingConfirmation.value).toBeNull()
    })
  })

  describe('built-in actions', () => {
    it('setState updates data at path', async () => {
      let ctx: any
      let dataCtx: any

      const TestComponent = defineComponent({
        setup() {
          dataCtx = provideData({ initialState: { count: 0 } })
          provideActions({})
          return () => h(defineComponent({
            setup() {
              ctx = useActions()
              return () => null
            },
          }))
        },
      })

      mount(TestComponent)
      await ctx.execute({ action: 'setState', params: { path: 'count', value: 5 } })

      expect(dataCtx.get('count')).toBe(5)
    })

    it('pushState appends to array', async () => {
      let ctx: any
      let dataCtx: any

      const TestComponent = defineComponent({
        setup() {
          dataCtx = provideData({ initialState: { items: ['a', 'b'] } })
          provideActions({})
          return () => h(defineComponent({
            setup() {
              ctx = useActions()
              return () => null
            },
          }))
        },
      })

      mount(TestComponent)
      await ctx.execute({ action: 'pushState', params: { path: 'items', value: 'c' } })

      expect(dataCtx.get('items')).toEqual(['a', 'b', 'c'])
    })

    it('removeState removes from array by index', async () => {
      let ctx: any
      let dataCtx: any

      const TestComponent = defineComponent({
        setup() {
          dataCtx = provideData({ initialState: { items: ['a', 'b', 'c'] } })
          provideActions({})
          return () => h(defineComponent({
            setup() {
              ctx = useActions()
              return () => null
            },
          }))
        },
      })

      mount(TestComponent)
      await ctx.execute({ action: 'removeState', params: { path: 'items', index: 1 } })

      expect(dataCtx.get('items')).toEqual(['a', 'c'])
    })
  })
})
