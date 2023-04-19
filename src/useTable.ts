import { inject, reactive, ref, toRefs, watch } from 'vue-demi'
import { message } from 'ant-design-vue'
import axios from 'axios'
import { getRequest } from '@yy-web/request'
import { toValue, useIntervalFn, useToggle } from '@vueuse/core'
import type { Ref } from 'vue-demi'
import type { MaybeRefOrGetter } from '@vueuse/core'
import type { Canceler } from 'axios'
import type { BusinessConf } from './provice'
import { businessKey } from './provice'
import { useSearch } from './useSearch'
import type { IUseSeachOptions } from './useSearch'

export interface IResponseTable<T> {
  records: T[]
  total: number
}

export interface IPageConf {
  total: number
  current: number
  limit: number
}

export interface UseTableOptions<T, U> extends IUseSeachOptions<T, U> {
  api: MaybeRefOrGetter<string>
  pagination?: boolean
  delApi?: MaybeRefOrGetter<string>
  afterSearch?: (result: T[]) => void
  loop?: number | false
  limitSize?: number
}

export function useTable<T = {}, U = {}>(options: UseTableOptions<T, U>) {
  const request = getRequest()!
  const {
    api,
    firstLoad = true,
    pagination = true,
    pageMethods = 'get',
    delApi = '',
    exportApi = '',
    initSearch = () => ({} as Partial<T & U>),
    beforeSearch = () => ({}),
    afterSearch = () => ({}),
    loop = false,
    limitSize = 0,
  } = options

  const { table } = inject(businessKey, {
    table: {},
  } as BusinessConf)

  const { listKey, totalKey, pageKey, sizeKey, initLimit } = Object.assign({
    pageKey: 'current',
    sizeKey: 'size',
    listKey: 'records',
    totalKey: 'total',
    initLimit: 10,
  }, table!)

  const dataSource: Ref<T[]> = ref([])
  const pageConf = reactive<IPageConf>({
    total: 0,
    current: 1,
    limit: limitSize || initLimit,
  })

  const {
    searchForm, initForm, cacheSearch, searchFlag, exportLoading,
    confirmTable, exportFile, resetPage, searchPage, searchParams,
  } = useSearch<T, U>({
    firstLoad,
    exportApi,
    pageMethods,
    initSearch,
    beforeSearch,
    handleSearch() {
      if (pageConf.current !== 1) {
        pageConf.current = 1
        return
      }
      getTable()
    },
    handleReset() {
      dataSource.value = []
    },
  })

  loop && useIntervalFn(() => {
    getTable()
  }, loop)

  const [loading, toggleLoading] = useToggle()

  let cancelToken: Canceler | null = null

  watch(() => pageConf.current, getTable)
  watch(() => pageConf.limit, searchPage)

  function getTable() {
    if (cancelToken) {
      cancelToken()
      cancelToken = null
    }
    const params = {
      [pageKey!]: pageConf.current,
      [sizeKey!]: pageConf.limit,
      ...searchParams(),
    }
    toggleLoading(true)
    request.setPath(toValue(api))
      .setConfig({ cancelToken: new axios.CancelToken(c => cancelToken = c) })[pageMethods as 'get']<any>(params)
      .then((result) => {
        const { records, total } = !pagination
          ? { records: result as T[], total: (result as T[]).length }
          : { records: result[listKey!], total: result[totalKey!] || 0 }
        dataSource.value = records
        pageConf.total = total
        afterSearch(records)
      }).finally(() => {
        toggleLoading(false)
        cancelToken = null
      })
  }

  function delDataRow(id: string | number, content = '是否删除？') {
    confirmTable(content, async () => {
      return request.setPath(`${toValue(delApi)}`).carry(id).del()
        .then(() => {
          message.success('删除成功')
          if (dataSource.value.length === 1 && pageConf.current !== 1) {
            pageConf.current--
            return
          }
          getTable()
        })
    })
  }

  return {
    loading,
    exportLoading,
    searchForm,
    initForm,
    dataSource,
    searchFlag,
    cacheSearch,
    ...toRefs(pageConf),
    exportFile,
    delDataRow,
    getTable,
    confirmTable,
    resetTable: resetPage,
    searchTable: searchPage,
  }
}
