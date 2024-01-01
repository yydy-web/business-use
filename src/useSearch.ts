import type { MaybeRefOrGetter } from '@vueuse/core'
import { inject, onMounted, ref } from 'vue-demi'
import type { BusinessConf } from './provice'
import { businessKey } from './provice'

export interface IUseSeachOptions<T> {
  initSearch?: () => Partial<T>
  exportApi?: MaybeRefOrGetter<string>
  beforeSearch?: (params?: T) => { [key: string]: any }
  pageMethods?: 'get' | 'post'
  handleSearch?: (params?: T) => void
  handleReset?: () => void
  beforeExport?: () => void
  afterExport?: () => void
  firstLoad?: boolean
}

export function useSearch<T = object>(options: IUseSeachOptions<T>) {
  const {
    initSearch = () => ({} as Partial<T>),
    beforeSearch = () => ({}),
    handleSearch,
    handleReset = () => ({}),
    firstLoad = true,
  } = options

  const searchFlag = ref(0)
  const searchForm = ref<Partial<T>>({})
  const cacheSearch = ref<Partial<T>>({})

  const { confirmTip, resetType } = inject(businessKey, {
    confirmTip: undefined,
    resetType: undefined,
  } as BusinessConf)

  onMounted(() => {
    firstLoad && searchPage()
  })

  function searchParams() {
    const params = cacheSearch.value as T
    return { ...params, ...beforeSearch(params) }
  }

  function confirmTable(content: string, callback: () => PromiseLike<void>, cancelFn?: () => PromiseLike<void>) {
    confirmTip && confirmTip(content, callback, cancelFn)
  }

  function searchPage() {
    searchFlag.value++
    const initForm = initSearch()
    const cacheSearchParams = Object.assign({}, initForm, searchForm.value)
    cacheSearch.value = JSON.parse(JSON.stringify(cacheSearchParams))
    handleSearch && handleSearch(searchParams())
  }

  function resetPage() {
    handleReset()
    ;(Object.entries(searchForm.value || {}).map(([k, v]) => [k, Array.isArray(v) ? [] : resetType]) as [string, any])
      .forEach(([k, v]) => {
        k && ((searchForm.value as Record<string, any>)[k] = v)
      })
    searchPage()
  }

  return {
    searchFlag,
    searchForm,
    cacheSearch,
    searchParams,
    searchPage,
    resetPage,
    confirmTable,
  }
}
