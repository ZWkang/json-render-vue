export interface Spec {
  type: string
  props?: Record<string, any>
  children?: Spec[] | string
  [key: string]: any
}

export interface Action {
  type: string
  payload?: any
  confirm?: string // Message for confirmation
}

export type DataBinding = [any, (value: any) => void]
