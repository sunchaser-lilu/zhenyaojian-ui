<template>
  <page-layout>
    <a-card :bordered="false">
      <a-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data-source="data"
        :pagination="pagination"
        @change="tableChange"
        bordered
        :loading="loading"
        :scroll="{ x: 'calc(700px + 50%)' }"
      >
        <span slot="id" slot-scope="text, record, index">
          {{ (pagination.current - 1) * pagination.pageSize + parseInt(index) + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="action" slot-scope="text, record">
          <a @click="showDetail(record)"><a-icon type="eye" />详情</a>
        </span>
      </a-table>
    </a-card>
    <log-detail :visible="visible" :data="logDetail" title="操作日志详情" />
  </page-layout>
</template>
<script>
import PageLayout from '@/layouts/PageLayout'
import { getPageLogList } from '@/services/logs'
import { deviceTypeMap } from '@/utils/util'
import LogDetail from '../LogDetail.vue'

const columns = [
  {
    title: '编号',
    scopedSlots: { customRender: 'id' },
    width: 70
  },
  {
    title: '请求 IP',
    dataIndex: 'requestIp',
    width: 150
  },
  {
    title: '设备类型',
    dataIndex: 'deviceType',
    customRender: (text) => {
      return deviceTypeMap[text]
    },
    width: 100
  },
  {
    title: '浏览器',
    dataIndex: 'browser',
    width: 130
  },
  {
    title: '操作系统',
    dataIndex: 'os',
    width: 100
  },
  {
    title: '地理位置',
    dataIndex: 'region',
    width: 150
  },
  {
    title: '操作人',
    dataIndex: 'userAccount',
    width: 100
  },
  {
    title: '操作描述',
    dataIndex: 'description',
    customRender: (text) => {
      return text || '—'
    },
    width: 200
  },
  {
    title: '操作类型',
    dataIndex: 'type',
    customRender: (text) => {
      return typeMap[text] || '—'
    },
    width: 100
  },
  {
    title: '操作状态',
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' },
    width: 100
  },
  {
    title: '操作开始时间',
    dataIndex: 'startTime',
    width: 180
  },
  {
    title: '操作耗时',
    dataIndex: 'rt',
    customRender: (text) => {
      return text + ' ms'
    },
    width: 100
  },
  {
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
    width: 80,
    scopedSlots: { customRender: 'action' }
  }
]

const statusMap = {
  0: {
    status: 'success',
    text: '成功'
  },
  1: {
    status: 'error',
    text: '异常'
  }
}

const typeMap = {
  OTHER: '其它',
  SELECT: '查询',
  INSERT: '新增',
  UPDATE: '更新',
  DELETE: '删除',
  LOGIN: '登录',
  IMPORT: '导入',
  EXPORT: '导出',
  STATUS: '更新状态',
  CLEAN: '清除数据'
}

export default {
  name: 'OperateLog',
  components: {
    PageLayout,
    LogDetail
  },
  data() {
    this.columns = columns
    return {
      // 表格数据
      data: null,
      // 表格加载
      loading: false,
      pagination: {
        // 总记录数
        total: 0,
        current: 1,
        pageSize: 10,
        // 默认每页记录数
        defaultPageSize: 10,
        showTotal: (total) => `共 ${total} 条记录`,
        // 只有一页时是否隐藏分页器
        hideOnSinglePage: false,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        onShowSizeChange: (current, pageSize) => (this.pageSize = pageSize)
      },
      // 查询参数
      queryParam: {},
      // 详情页抽屉展示
      visible: false,
      // 详情页数据
      logDetail: {}
    }
  },
  filters: {
    statusFilter(status) {
      return statusMap[status].text
    },
    statusTypeFilter(status) {
      return statusMap[status].status
    }
  },
  created() {
    this.fetchPageLogList()
  },
  methods: {
    fetchPageLogList() {
      this.loading = true
      this.queryParam = {
        pageNo: this.pagination.current,
        pageSize: this.pagination.pageSize
      }
      getPageLogList(this.queryParam)
        .then((res) => {
          this.data = res.data
          this.pagination.total = res.count
        })
        .finally(() => {
          this.loading = false
        })
    },
    tableChange(pagination, filters, sorter) {
      this.pagination = pagination
      this.fetchPageLogList()
    },
    showDetail(record) {
      this.logDetail = record
      this.visible = true
    }
  }
}
</script>
