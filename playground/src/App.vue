<script lang="ts" setup>
import { useTable } from '@yy-web/business-use'
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

const { dataSource, loading, current, limit, total, searchForm, searchTable, resetTable } = useTable<{ a: string }>({
  api: '/banner/page',
})
</script>

<template>
  <a-input v-model:value="searchForm.a" />
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
