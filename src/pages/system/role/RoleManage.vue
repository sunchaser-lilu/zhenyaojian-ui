<template>
  <page-layout>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="24">
            <a-col :md="8" :sm="24">
              <a-form-item label="角色名称">
                <a-input v-model="queryParam.name" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="fetchPageRoleList()">搜索</a-button>
                <a-button
                  style="margin-left: 8px"
                  @click="
                    () => {
                      this.queryParam = {}
                      fetchPageRoleList()
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
        :pagination="true"
        bordered
        :loading="loading"
      >
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="action" slot-scope="text, record">
          <template v-if="record.id === 1"><a-tag color="red">无法操作超级管理员角色</a-tag></template>
          <template v-if="record.id !== 1">
            <a style="margin-right: 8px" @click="handleEdit(record)"><a-icon type="edit" />编辑</a>
            <a style="margin-right: 8px" @click="handleAssign(record)"><a-icon type="snippets" />赋权</a>
            <a-popconfirm
              :title="'确认' + disableOrEnable(record.status) + '该角色吗?'"
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleDisableConfirm(record)"
              @cancel="handleConfirmCancel()"
            >
              <a style="margin-right: 8px">
                <a-icon :type="record.status === 0 ? 'close-circle' : 'check-circle'" />{{
                  disableOrEnable(record.status)
                }}
              </a>
            </a-popconfirm>
            <a-popconfirm
              title="确认删除该角色吗?"
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

      <ops-role-form
        ref="opsRoleModal"
        :visible="visible"
        :loading="confirmLoading"
        :model="mdl"
        @cancel="handleCancel"
        @ok="handleOk"
      />

      <assign-permission
        ref="assignPermissionModal"
        :visible="assignVisible"
        :loading="confirmLoading"
        :model="mdl"
        @ok="handleAssignOk"
        @cancel="handleAssignCancel"
      />
    </a-card>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import OpsRoleForm from './modules/OpsRoleForm'
import AssignPermission from './modules/AssignPermission'
import { createRole, updateRole, deleteRole, getPageRoleList, assignRolePermission } from '@/services/role'

const columns = [
  {
    title: '角色名称',
    dataIndex: 'name'
  },
  {
    title: '显示排序',
    dataIndex: 'sortValue'
  },
  {
    title: '状态',
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '最后更新时间',
    dataIndex: 'updateTime'
  },
  {
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
    width: 240,
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
    text: '停用'
  }
}

export default {
  name: 'RoleManage',
  components: {
    PageLayout,
    OpsRoleForm,
    AssignPermission
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
      loading: false,
      assignVisible: false
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
    this.fetchPageRoleList()
  },
  methods: {
    fetchPageRoleList() {
      this.loading = true
      getPageRoleList(this.queryParam)
        .then((res) => {
          this.data = res.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleAdd() {
      this.visible = true
    },
    handleEdit(record) {
      this.visible = true
      this.mdl = { ...record }
    },
    handleAssign(record) {
      this.assignVisible = true
      this.mdl = { ...record }
    },
    handleOk() {
      const opsRoleModal = this.$refs.opsRoleModal
      this.confirmLoading = true
      opsRoleModal.form.validateFields((errors, values) => {
        if (!errors) {
          if (values.id > 0) {
            // 修改 e.g.
            updateRole(values)
              .then(() => {
                this.okPostProcess(opsRoleModal)
                this.$message.success('修改成功')
              })
              .finally(() => {
                this.confirmLoading = false
              })
          } else {
            // 新增
            createRole(values)
              .then(() => {
                this.okPostProcess(opsRoleModal)
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
    okPostProcess(opsRoleModal) {
      this.visible = false
      // 重置表单数据
      opsRoleModal.form.resetFields()
      // 刷新表格
      this.fetchPageRoleList()
    },
    handleCancel() {
      this.visible = false
      const form = this.$refs.opsRoleModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handleAssignOk() {
      const assignPermissionModal = this.$refs.assignPermissionModal
      this.confirmLoading = true
      assignPermissionModal.form.validateFields((errors, values) => {
        if (!errors) {
          console.log(values)
          assignRolePermission({ roleId: values.id, permissionIds: values.permissionIds })
            .then(() => {
              this.assignVisible = false
              // 重置表单数据
              assignPermissionModal.form.resetFields()
            })
            .finally(() => {
              this.confirmLoading = false
            })
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleAssignCancel() {
      this.assignVisible = false
    },
    disableOrEnable(status) {
      return status === 0 ? '停用' : '启用'
    },
    handleDisableConfirm(record) {
      updateRole({ id: record.id, name: record.name, status: record.status === 0 ? 1 : 0 }).then(() => {
        this.$message.success(this.disableOrEnable(record.status) + '成功')
        // 刷新表格
        this.fetchPageRoleList()
      })
    },
    handleDelConfirm(record) {
      deleteRole(record.id).then(() => {
        // 刷新表格
        this.fetchPageRoleList()
        this.$message.success('删除成功')
      })
    },
    handleConfirmCancel() {
      this.$message.info('操作取消')
    }
  }
}
</script>
