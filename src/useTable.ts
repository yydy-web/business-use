import { inject, reactive, ref, toRefs, watch } from 'vue-demi'
import { useIntervalFn, useToggle } from '@vueuse/core'
import type { Ref } from 'vue-demi'
import type { BusinessConf, TableConf } from './provice'
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

export interface UseTableOptions<T extends object, U extends object> extends IUseSeachOptions<T, U> {
  apiAction: (data: T & U & Pick<TableConf, 'pageKey' | 'sizeKey'>) => Promise<any>
  pagination?: boolean
  delAction?: (id: string | number) => Promise<boolean>
  afterSearch?: (result: T[]) => void
  loop?: number | false
  limitSize?: number
}

export function useTable<T extends object, U extends object = object>(options: UseTableOptions<T, U>) {
  const {
    apiAction,
    firstLoad = true,
    pagination = true,
    pageMethods = 'get',
    delAction = undefined,
    exportApi = '',
    initSearch = () => ({} as Partial<T & U>),
    beforeSearch = () => ({}),
    afterSearch = () => ({}),
    loop = false,
    limitSize = 0,
  } = options

  const { table, successTip } = inject(businessKey, {
    table: {},
    successTip: undefined,
  } as BusinessConf)

  const { listKey, totalKey, pageKey, sizeKey, initLimit, pageOffset } = Object.assign({
    pageKey: 'current',
    sizeKey: 'size',
    listKey: 'records',
    totalKey: 'total',
    initLimit: 10,
    pageOffset: 0,
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

  watch(() => pageConf.current, getTable)
  watch(() => pageConf.limit, searchPage)

  function getTable() {
    const params = {
      [pageKey as string]: pageConf.current - pageOffset,
      [sizeKey as string]: pageConf.limit,
      ...searchParams(),
    }
    toggleLoading(true)
    apiAction(params).then((result) => {
      const { records, total } = !pagination
        ? { records: result as T[], total: (result as T[]).length }
        : { records: result[listKey!], total: result[totalKey!] || 0 }
      dataSource.value = records
      pageConf.total = total
      afterSearch(records)
    }).finally(() => {
      toggleLoading(false)
    })
  }

  function delDataRow(id: string | number, content = '是否删除？') {
    confirmTable(content, async () => {
      if (typeof delAction === 'undefined')
        throw new Error('error config del action')

      return delAction(id)
        .then(() => {
          successTip && successTip('删除成功！')
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
