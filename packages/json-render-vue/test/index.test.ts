import { assert, it } from 'vitest'
import { Renderer, useData, useActions } from '../src'

it('exports core components and composables', () => {
  assert.ok(Renderer)
  assert.ok(useData)
  assert.ok(useActions)
})
