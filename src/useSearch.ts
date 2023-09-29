import type { MaybeRefOrGetter } from '@vueuse/core'
import { useToggle } from '@vueuse/core'
import { inject, onMounted, ref } from 'vue-demi'
import type { BusinessConf } from './provice'
import { businessKey } from './provice'

export interface IUseSeachOptions<T, U> {
  initSearch?: () => Partial<T & U>
  exportApi?: MaybeRefOrGetter<string>
  beforeSearch?: (params?: U & T) => { [key: string]: any }
  pageMethods?: 'get' | 'post'
  handleSearch?: (params?: U & T) => void
  handleReset?: () => void
  beforeExport?: () => void
  afterExport?: () => void
  firstLoad?: boolean
}

export function useSearch<T = object, U = object>(options: IUseSeachOptions<T, U>) {
  const {
    initSearch = () => ({} as Partial<T & U>),
    beforeSearch = () => ({}),
    pageMethods = 'get',
    exportApi,
    handleSearch,
    handleReset = () => ({}),
    firstLoad = true,
  } = options

  const searchFlag = ref(0)
  const initForm = ref<Partial<U>>({})
  const searchForm = ref<Partial<T>>(initSearch ? initSearch() : {})
  const cacheSearch = ref<Partial<U & T>>({})
  const [exportLoading, toggleExportLoading] = useToggle()

  const { confirmTip } = inject(businessKey, {
    confirmTip: undefined,
  } as BusinessConf)

  onMounted(() => {
    firstLoad && searchPage()
  })

  function searchParams() {
    const params = cacheSearch.value as U & T
    return { ...params, ...beforeSearch(params) }
  }

  function confirmTable(content: string, callback: () => PromiseLike<void>, cancelFn?: () => PromiseLike<void>) {
    confirmTip && confirmTip(content, callback, cancelFn)
  }

  function searchPage() {
    searchFlag.value++
    cacheSearch.value = JSON.parse(JSON.stringify({ ...searchForm.value || {}, ...initForm.value || {} }))
    handleSearch && handleSearch(searchParams())
  }

  function resetPage() {
    handleReset()
    const initSearchObj = initSearch ? initSearch() : {}
    ;([...Object.entries(searchForm.value || {}).map(([k, v]) => [k, Array.isArray(v) ? [] : undefined]),
      ...Object.entries(initSearchObj)] as [string, any][])
      .forEach(([k, v]) => {
        k && ((searchForm.value as Record<string, any>)[k] = v)
      })
    searchPage()
  }

  return {
    searchFlag,
    initForm,
    searchForm,
    cacheSearch,
    exportLoading,
    searchParams,
    searchPage,
    resetPage,
    confirmTable,
  }
}
