import { inject, reactive, ref, toRefs, watch } from 'vue-demi'
import { useToggle } from '@vueuse/core'
import type { BusinessConf, TableConf } from './provice'
import { businessKey } from './provice'
import { useSearch } from './useSearch'
import type { IUseSeachOptions } from './useSearch'

export interface IResponseTable<Data> {
  records: Data[]
  total: number
}

export interface IPageConf {
  total: number
  current: number
  limit: number
}

export interface UseTableOptions<Search extends object, Data extends object> extends IUseSeachOptions<Search> {
  apiAction: (data: Search & Pick<TableConf, 'pageKey' | 'sizeKey'>) => Promise<any>
  pagination?: boolean
  delAction?: (id: string | number) => Promise<boolean>
  afterSearch?: (result: Data[]) => void
  limitSize?: number
}

export function useTable<Search extends object, Data extends object = object>(options: UseTableOptions<Search, Data>) {
  const {
    apiAction,
    firstLoad = true,
    pagination = true,
    pageMethods = 'get',
    delAction = undefined,
    exportApi = '',
    initSearch = () => ({} as Partial<Search>),
    beforeSearch = () => ({}),
    afterSearch = () => ({}),
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

  const dataSource = ref<Data[]>([])
  const pageConf = reactive<IPageConf>({
    total: 0,
    current: 1,
    limit: limitSize || initLimit,
  })

  const {
    searchForm, cacheSearch, searchFlag,
    confirmTable, resetPage, searchPage, searchParams,
  } = useSearch<Search>({
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
        ? { records: result as Data[], total: (result as Data[]).length }
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
    searchForm,
    dataSource,
    searchFlag,
    cacheSearch,
    ...toRefs(pageConf),
    delDataRow,
    getTable,
    confirmTable,
    resetTable: resetPage,
    searchTable: searchPage,
  }
}
