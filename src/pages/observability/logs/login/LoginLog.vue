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
  </page-layout>
</template>
<script>
import PageLayout from '@/layouts/PageLayout'
import { getPageLogList } from '@/services/logs'
import { deviceTypeMap } from '@/utils/util'

const columns = [
  {
    title: '编号',
    scopedSlots: { customRender: 'id' },
    width: 70
  },
  {
    title: '登录 IP',
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
    title: '登录账号',
    dataIndex: 'userAccount',
    width: 100
  },
  {
    title: '登录状态',
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' },
    width: 100
  },
  {
    title: '登录时间',
    dataIndex: 'startTime',
    width: 180
  },
  {
    title: '登录耗时',
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

export default {
  name: 'LoginLog',
  components: {
    PageLayout
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
      queryParam: {}
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
        pageSize: this.pagination.pageSize,
        type: 'LOGIN'
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
    showDetail() {
      console.log('showDetail')
    }
  }
}
</script>
