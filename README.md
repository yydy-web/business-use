## @yy-web/business-use
## useSearch函数
该函数提供了一个搜索相关的逻辑封装，可以用于Vue.js的应用程序中。它接受一个泛型参数T和U，并根据传递的参数进行搜索并返回结果。函数主要功能包括：

- 构建搜索参数
- 调用搜索请求
- 重置搜索表单
- 导出搜索结果
### 函数参数
| 参数	| 类型	| 说明 |
| - | - | - |
| options |	IUseSeachOptions<T, U> | 配置参数对象，包含以下属性 |
### options参数属性
| 属性	| 类型	|默认值 |	说明 |
| - | - | - | - |
| initSearch |	() => Partial<T & U> |	() => ({}) as Partial<T & U>|	初始搜索表单值
| beforeSearch |	(params?: Record<string, any>) => Record<string, any> |	() => ({})	|构建搜索参数之前的钩子函数
| pageMethods |	'get' \| 'post' |	'get' |	请求搜索接口的方式
|exportApi |	MaybeComputedRef<string> |	undefined	| 导出搜索结果接口路径
|handleSearch|	(params: T & U) => void|	undefined |	处理搜索请求结果的回调函数
|handleReset	|() => void|	() => ({})	|重置搜索表单的回调函数
|beforeExport	|() => void|	undefined	|导出搜索结果之前的回调函数
|afterExport|	() => void|	undefined	|导出搜索结果之后的回调函数
|firstLoad|	boolean	|true	|是否在页面加载后首次执行搜索
### 函数返回值
|属性	| 类型	|说明
| - | - | - |
|searchFlag |	Ref<number>|	搜索标志位，每次搜索时递增
|initForm|	Ref<Partial<U>>|	初始表单值的引用
|searchForm|	Ref<Partial<T>>|	搜索表单值的引用
|cacheSearch|	Ref<Partial<U & T>>	|缓存搜索表单值的引用
|exportLoading|	Ref<boolean>	|导出结果时的加载状态
|searchParams	|() => Record<string, any>	|构建搜索参数的函数
|searchPage|	() => void|	执行搜索的函数
|resetPage|	() => void|	重置搜索表单并重新执行搜索的函数
|exportFile|	() => Promise<void>	|导出搜索结果的函数
|confirmTable|	(content: string, callback: () => PromiseLike<void>, \|cancelFn?: () => void) => void	|显示模态对话框的函数，用于确认一些操作
