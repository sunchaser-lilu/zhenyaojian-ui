<template>
  <page-layout>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="24">
            <a-col :md="8" :sm="24">
              <a-form-item label="用户账号">
                <a-input v-model="queryParam.account" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="fetchPageUserList()">搜索</a-button>
                <a-button
                  style="margin-left: 8px"
                  @click="
                    () => {
                      this.queryParam = {}
                      fetchPageUserList()
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
        :scroll="{ x: 'calc(700px + 50%)' }"
      >
        <span slot="avatar" slot-scope="text">
          <a-avatar :src="text" />
        </span>
        <span slot="sex" slot-scope="text">
          <a-tag :color="text === '男' ? 'blue' : text === '女' ? 'pink' : ''"> {{ text }} </a-tag>
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="action" slot-scope="text, record">
          <template v-if="record.id === 1"><a-tag color="red">超级管理员账户</a-tag></template>
          <template v-if="record.id !== 1">
            <a style="margin-right: 8px" @click="handleEdit(record)"><a-icon type="edit" />编辑</a>
            <a-popconfirm
              :title="'确认' + disableOrEnable(record.status) + '该用户吗?'"
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
              title="确认删除该用户吗?"
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleDelConfirm(record)"
              @cancel="handleConfirmCancel()"
            >
              <a style="margin-right: 8px"><a-icon type="delete" />删除</a>
            </a-popconfirm>
            <a-dropdown>
              <a class="ant-dropdown-link" @click="(e) => e.preventDefault()"><a-icon type="double-right" />更多</a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a @click="handleAssign(record)"><a-icon type="snippets" /> 分配角色</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleResetPassword(record)"><a-icon type="snippets" /> 重置密码</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
        </span>
      </a-table>

      <ops-user-form
        ref="opsUserModal"
        :visible="visible"
        :loading="confirmLoading"
        :model="mdl"
        @cancel="handleCancel"
        @ok="handleOk"
      />

      <assign-role
        ref="assignRoleModal"
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
import OpsUserForm from './modules/OpsUserForm'
import AssignRole from './modules/AssignRole'
import { createUser, updateUser, deleteUser, getPageUserList, assignUserRole } from '@/services/user'

const columns = [
  {
    title: '账号',
    dataIndex: 'account',
    ellipsis: true
  },
  {
    title: '昵称',
    dataIndex: 'nickName',
    customRender: (text) => {
      return text || '—'
    },
    ellipsis: true
  },
  {
    title: '头像',
    dataIndex: 'avatar',
    scopedSlots: { customRender: 'avatar' }
  },
  {
    title: '性别',
    dataIndex: 'sex',
    scopedSlots: { customRender: 'sex' }
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    customRender: (text) => {
      return text || '—'
    },
    width: 180,
    ellipsis: true
  },
  {
    title: '电话号码',
    dataIndex: 'phoneNumber',
    customRender: (text) => {
      return text || '—'
    }
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
    width: 230,
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
  name: 'UserManage',
  components: {
    PageLayout,
    OpsUserForm,
    AssignRole
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
    this.fetchPageUserList()
  },
  methods: {
    fetchPageUserList() {
      this.loading = true
      getPageUserList(this.queryParam)
        .then((res) => {
          this.data = res.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    onStatusChange(record, checked) {
      // + 语法，将布尔值转化为数字
      record.status = +!checked
      updateUser(record).then(() => {})
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
    handleResetPassword(record) {
      this.$confirm({
        title: '信息',
        content: `您确定要重置账户 [${record.account}] 的密码吗？`,
        onOk() {
          return new Promise((resolve, reject) => {
            updateUser({ id: record.id, userOpsType: 'RESET_PASSWORD' })
              .then(() => {
                setTimeout(() => {
                  resolve()
                }, 1000)
              })
              .catch((err) => reject(err))
          }).catch(() => {
            console.log('Oops errors!')
          })
        },
        onCancel() {}
      })
    },
    handleOk() {
      const opsUserModal = this.$refs.opsUserModal
      this.confirmLoading = true
      opsUserModal.form.validateFields((errors, values) => {
        if (!errors) {
          if (values.id > 0) {
            // 修改 e.g.
            updateUser(values)
              .then(() => {
                this.okPostProcess(opsUserModal)
                this.$message.success('修改成功')
              })
              .finally(() => {
                this.confirmLoading = false
              })
          } else {
            // 新增
            createUser(values)
              .then(() => {
                this.okPostProcess(opsUserModal)
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
    okPostProcess(opsUserModal) {
      this.visible = false
      this.confirmLoading = false
      // 重置表单数据
      opsUserModal.form.resetFields()
      // 刷新表格
      this.fetchPageUserList()
    },
    handleCancel() {
      this.visible = false
      const form = this.$refs.opsUserModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handleAssignOk() {
      const assignRoleModal = this.$refs.assignRoleModal
      this.confirmLoading = true
      assignRoleModal.form.validateFields((errors, values) => {
        if (!errors) {
          console.log(values)
          assignUserRole({ userId: values.id, roleIds: values.roleIds })
            .then(() => {
              this.assignVisible = false
              // 重置表单数据
              assignRoleModal.form.resetFields()
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
      updateUser({ id: record.id, status: record.status === 0 ? 1 : 0 }).then(() => {
        this.$message.success(this.disableOrEnable(record.status) + '成功')
        // 刷新表格
        this.fetchPageUserList()
      })
    },
    handleDelConfirm(record) {
      deleteUser(record.id).then(() => {
        // 刷新表格
        this.fetchPageUserList()
        this.$message.success('删除成功')
      })
    },
    handleConfirmCancel() {
      this.$message.info('操作取消')
    }
  }
}
</script>
