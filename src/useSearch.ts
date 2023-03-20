import type { MaybeComputedRef } from '@vueuse/core'
import { resolveUnref, useToggle } from '@vueuse/core'
import { onMounted, ref } from 'vue-demi'
import { Modal } from 'ant-design-vue'
import { getRequest } from '@yy-web/request'

export interface IUseSeachOptions<T, U> {
  initSearch?: () => Partial<T & U>
  exportApi?: MaybeComputedRef<string>
  beforeSearch?: (params?: Record<string, any>) => Record<string, any>
  pageMethods?: 'get' | 'post'
  handleSearch?: (params: T & U) => void
  handleReset?: () => void
  beforeExport?: () => void
  afterExport?: () => void
  firstLoad?: boolean
}

export function useSearch<T = {}, U = {}>(options: IUseSeachOptions<T, U>) {
  const request = getRequest()!
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

  onMounted(() => {
    firstLoad && searchPage()
  })

  function searchParams() {
    const searchParams = { ...initForm.value, ...searchForm.value, ...cacheSearch.value }
    return { ...searchParams, ...beforeSearch(searchParams) }
  }

  function confirmTable(content: string, callback: () => PromiseLike<void>, cancelFn?: () => void) {
    Modal.confirm({
      title: '温馨提示',
      centered: true,
      content,
      okText: '确定',
      cancelText: '取消',
      async onOk() {
        try {
          await callback()
        }
        catch (error) {
          return Promise.reject(error)
        }
      },
      onCancel() {
        typeof cancelFn === 'function' && cancelFn()
      },
    })
  }

  function searchPage() {
    searchFlag.value++
    cacheSearch.value = JSON.parse(JSON.stringify(searchForm.value))
    handleSearch && handleSearch(searchParams())
  }

  function resetPage() {
    handleReset()
    const initSearchObj = initSearch ? initSearch() : {}
    ;[...Object.entries(searchForm.value).map(([k, v]) => [k, Array.isArray(v) ? [] : undefined]),
      ...Object.entries(initSearchObj)]
      .forEach(([k, v]) => {
        k && (searchForm.value[k as string] = v)
      })
    searchPage()
  }

  function exportFile() {
    toggleExportLoading(true)
    request.setPath(resolveUnref(exportApi!), true)
      .downLoad(searchParams(), pageMethods).finally(() => { toggleExportLoading(false) })
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
    exportFile,
    confirmTable,
  }
}
