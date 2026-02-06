import type { Component } from 'vue'
import Card from './components/Card.vue'
import Button from './components/Button.vue'
import Input from './components/Input.vue'

/**
 * TDesign Vue Next component registry for json-render
 */
export const tdesignRegistry: Record<string, Component> = {
  Card,
  Button,
  Input,
  // Add more components as needed
}

export { tdesignCatalog, type TDesignCatalog } from './catalog'
export { default as Card } from './components/Card.vue'
export { default as Button } from './components/Button.vue'
export { default as Input } from './components/Input.vue'

export const VERSION = '0.0.0'

