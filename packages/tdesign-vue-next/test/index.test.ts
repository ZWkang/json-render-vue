import { assert, it } from 'vitest'
import { tdesignCatalog, tdesignRegistry } from '../src'

it('exports registry and catalog', () => {
  assert.ok(tdesignRegistry)
  assert.ok(tdesignCatalog)
  assert.ok(tdesignRegistry.Card)
})
