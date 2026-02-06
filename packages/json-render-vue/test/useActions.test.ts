import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { provideActions, useActions } from '../src/composables/useActions'

function createActionsProvider(config: any, childSetup: () => any) {
  return defineComponent({
    setup() {
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
      await ctx.execute({ type: 'submit' })

      expect(onAction).toHaveBeenCalledWith({ type: 'submit' })
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

      const executePromise = ctx.execute({ type: 'submit' })
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
      await ctx.execute({ type: 'delete', confirm: 'Are you sure?' })

      expect(ctx.pendingConfirmation.value).toEqual({ type: 'delete', confirm: 'Are you sure?' })
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
      await ctx.execute({ type: 'delete', confirm: true })

      expect(ctx.pendingConfirmation.value).not.toBeNull()
      expect(onAction).not.toHaveBeenCalled()

      await ctx.confirm()

      expect(onAction).toHaveBeenCalledWith({ type: 'delete', confirm: true })
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
      await ctx.execute({ type: 'delete', confirm: 'Sure?' })

      ctx.cancel()

      expect(onAction).not.toHaveBeenCalled()
      expect(ctx.pendingConfirmation.value).toBeNull()
    })
  })
})
