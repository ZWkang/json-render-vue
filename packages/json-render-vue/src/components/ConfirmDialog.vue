<script setup lang="ts">
import { computed } from 'vue'

import { useActions } from '../composables/useActions'
import type { Action } from '../types/catalog-types'

defineOptions({ name: 'ConfirmDialog' })

const { pendingConfirmation, confirm, cancel } = useActions()

const open = computed(() => pendingConfirmation.value !== null)

const message = computed(() => {
  const action = pendingConfirmation.value as Action | null
  const confirmText = (action as any)?.confirm
  return typeof confirmText === 'string' ? confirmText : 'Are you sure?'
})

function onConfirm() {
  void confirm()
}

function onCancel() {
  cancel()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      role="dialog"
      aria-modal="true"
      :style="{
        position: 'fixed',
        inset: '0',
        background: 'rgba(0, 0, 0, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 9999,
      }"
      @click.self="onCancel"
    >
      <div
        :style="{
          width: 'min(520px, 100%)',
          background: '#fff',
          color: '#111',
          borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          padding: '16px',
        }"
      >
        <slot
          :action="pendingConfirmation"
          :message="message"
          :confirm="confirm"
          :cancel="cancel"
        >
          <div :style="{ fontSize: '14px', lineHeight: '1.5' }">
            <slot name="message" :action="pendingConfirmation" :message="message">
              {{ message }}
            </slot>
          </div>

          <div
            :style="{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '16px',
            }"
          >
            <slot name="actions" :action="pendingConfirmation" :confirm="confirm" :cancel="cancel">
              <slot name="cancel-button" :cancel="cancel">
                <button type="button" @click="onCancel">
                  Cancel
                </button>
              </slot>
              <slot name="confirm-button" :confirm="confirm">
                <button type="button" @click="onConfirm">
                  Confirm
                </button>
              </slot>
            </slot>
          </div>
        </slot>
      </div>
    </div>
  </Teleport>
</template>
