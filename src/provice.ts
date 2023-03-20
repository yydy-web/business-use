import type { App } from 'vue-demi'

export const businessKey = Symbol('yy-business')

interface TableConf {
  pageKey?: string
  sizeKey?: string
  listKey?: string
  totalKey?: string
  initLimit?: number
}

export interface BusinessConf {
  table?: TableConf
}

export function confBusiness(app: App, config?: BusinessConf) {
  app.provide(businessKey, config)
}
