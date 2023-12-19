import type { App } from 'vue-demi'

export const businessKey = Symbol('yy-business')

export interface TableConf {
  pageKey?: string
  sizeKey?: string
  listKey?: string
  totalKey?: string
  initLimit?: number
  pageOffset?: number
}

export interface BusinessConf {
  table?: TableConf
  confirmTip?: (content: string, successCb: () => PromiseLike<void>, cancelCb?: () => PromiseLike<void>) => void
  successTip?: (content: string) => void
  resetType?: string | number | null
}

export function confBusiness(app: App, config?: BusinessConf) {
  app.provide(businessKey, config)
}
