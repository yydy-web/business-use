<script lang="ts" setup>
import { useMouse } from '@vueuse/core'
import { useTable } from '@yy-web/business-use'
import { getRequest } from '@yy-web/request'

const columns = [
  {
    name: 'id',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'description',
    dataIndex: 'description',
    key: 'description',
  },
]

const { x, y } = useMouse()

const { dataSource, loading, current, limit, total, searchForm, searchTable, resetTable } = useTable<{ a: string }>({
  apiAction: (params) => {
    return getRequest()!.setPath('/banner/page').get(params)
  },
})
</script>

<template>
  <div>
    {{ x }}{{ y }}
    <a-input v-model:value="searchForm.a" />
  </div>
  <a-button type="primary" @click="searchTable">
    查询
  </a-button>
  <a-button @click="resetTable">
    重置
  </a-button>
  <a-table
    v-model:current="current" v-model:pageSize="limit" show-size-changer
    :page-size-options="[1, 2, 5, 10]"
    :total="total" :columns="columns" :data-source="dataSource" :loading="loading"
  >
    <template #headerCell="{ column }">
      <template v-if="column.key === 'name'">
        <span>
          Name
        </span>
      </template>
    </template>
  </a-table>
</template>
