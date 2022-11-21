<template>
  <page-layout>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="24">
            <a-col :md="8" :sm="24">
              <a-form-item label="菜单名称">
                <a-input v-model="queryParam.name" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="fetchPermissionList()">查询</a-button>
                <a-button
                  style="margin-left: 8px"
                  @click="
                    () => {
                      this.queryParam = {}
                      fetchPermissionList()
                    }
                  "
                >
                  重置
                </a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <a-space class="operator">
        <a-button @click="handleAdd()" type="primary" icon="plus">新建</a-button>
      </a-space>

      <a-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data-source="data"
        :pagination="false"
        bordered
        :loading="loading"
        :expandIcon="expandIcon"
        :scroll="{ x: 'calc(700px + 50%)' }"
      >
        <span slot="name" slot-scope="text, record">
          <a-icon :type="record.icon" />&nbsp;
          {{ text }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a style="margin-right: 8px" @click="handleAdd(record)"><a-icon type="plus" />新建</a>
            <a style="margin-right: 8px" @click="handleEdit(record)"><a-icon type="edit" />编辑</a>
            <a-popconfirm
              :title="'确认' + disableOrEnable(record.status) + '该菜单吗?'"
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleDisableConfirm(record)"
              @cancel="handleConfirmCancel()"
            >
              <a style="margin-right: 8px">
                <a-icon :type="record.status === 0 ? 'close-circle' : 'check-circle'" />
                {{ disableOrEnable(record.status) }}
              </a>
            </a-popconfirm>
            <a-popconfirm
              title="确认删除该条记录吗?"
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleDelConfirm(record)"
              @cancel="handleConfirmCancel()"
            >
              <a><a-icon type="delete" />删除</a>
            </a-popconfirm>
          </template>
        </span>
      </a-table>

      <create-form
        ref="createModal"
        :visible="visible"
        :loading="confirmLoading"
        :model="mdl"
        @cancel="handleCancel"
        @ok="handleOk"
      />
    </a-card>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { createPermission, updatePermission, deletePermission, getPermissionList } from '@/services/menu'
import CreateForm from './modules/CreateForm'
import { loadRoutes } from '@/utils/routerUtil'
import { getUserMenu } from '@/services/user'

const columns = [
  {
    title: '菜单名称',
    dataIndex: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    title: '路由地址',
    dataIndex: 'path',
    customRender: (text) => {
      return text || '—'
    },
    ellipsis: true
  },
  {
    title: '前端组件',
    dataIndex: 'component',
    customRender: (text) => {
      return text || '—'
    }
  },
  {
    title: '排序',
    dataIndex: 'sortValue'
  },
  {
    title: '状态',
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 180
  },
  {
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
    width: 233,
    scopedSlots: { customRender: 'action' }
  }
]

const statusMap = {
  0: {
    status: 'success',
    text: '正常'
  },
  1: {
    status: 'default',
    text: '隐藏'
  }
}

export default {
  name: 'MenuManage',
  components: {
    PageLayout,
    CreateForm
  },
  data() {
    this.columns = columns
    return {
      // create model
      visible: false,
      confirmLoading: false,
      mdl: null,
      // 查询参数
      queryParam: {},
      // 表格数据
      data: null,
      // 表格加载
      loading: false
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
    this.fetchPermissionList()
  },
  methods: {
    fetchPermissionList() {
      this.loading = true
      getPermissionList(this.queryParam)
        .then((res) => {
          this.data = res.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    disableOrEnable(status) {
      return status === 0 ? '隐藏' : '显示'
    },
    handleAdd(record) {
      this.visible = true
      this.mdl = {
        // 默认选择父级菜单
        parentId: record ? record.id : '0'
      }
      this.$refs.createModal.handleAddLinkage(record)
    },
    handleEdit(record) {
      this.visible = true
      this.mdl = { ...record }
      this.$refs.createModal.handleEditLinkage(record)
    },
    handleOk() {
      const createModal = this.$refs.createModal
      this.confirmLoading = true
      createModal.form.validateFields((errors, values) => {
        if (!errors) {
          if (values.id > 0) {
            // 修改 e.g.
            updatePermission(values)
              .then(() => {
                this.okPostProcess(createModal)
                this.$message.success('修改成功')
              })
              .finally(() => {
                this.confirmLoading = false
              })
          } else {
            // 新增
            createPermission(values)
              .then(() => {
                this.okPostProcess(createModal)
                this.$message.success('新增成功')
              })
              .finally(() => {
                this.confirmLoading = false
              })
          }
        } else {
          this.confirmLoading = false
        }
      })
    },
    okPostProcess(createModal) {
      this.visible = false
      this.confirmLoading = false
      // 重置表单数据
      createModal.form.resetFields()
      // 刷新表格
      this.fetchPermissionList()
      // 刷新上级菜单树形选择框
      createModal.fetchPermissionTree()
      // 刷新路由和左侧导航
      getUserMenu().then((res) => {
        loadRoutes(res.data)
      })
    },
    handleCancel() {
      this.visible = false
      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handleDisableConfirm(record) {
      updatePermission({ ...record, status: record.status === 0 ? 1 : 0 }).then(() => {
        this.$message.success(this.disableOrEnable(record.status) + '成功')
        // 刷新表格
        this.fetchPermissionList()
        // 刷新上级菜单树形选择框
        this.$refs.createModal.fetchPermissionTree()
        // 刷新路由和左侧导航
        getUserMenu().then((res) => {
          loadRoutes(res.data)
        })
      })
    },
    handleDelConfirm(record) {
      deletePermission(record.id).then(() => {
        // 刷新表格
        this.fetchPermissionList()
        this.$message.success('删除成功')
      })
    },
    handleConfirmCancel() {
      this.$message.info('操作取消')
    },
    // table 自定义展开图标
    expandIcon(props) {
      const children = props.record.children
      if (!children || children.length <= 0) {
        return <span class="ant-table-row-expand-icon ant-table-row-spaced" />
      }
      if (props.expanded) {
        return (
          <span
            onClick={(e) => {
              props.onExpand(props.record, e)
            }}
          >
            <a-icon type="down" />
            &nbsp;&nbsp;
          </span>
        )
      } else {
        return (
          <span
            onClick={(e) => {
              props.onExpand(props.record, e)
            }}
          >
            <a-icon type="right" />
            &nbsp;&nbsp;
          </span>
        )
      }
    }
  }
}
</script>
