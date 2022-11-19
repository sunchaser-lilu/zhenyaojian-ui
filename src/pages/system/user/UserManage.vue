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
                <a-button type="primary" @click="fetchPageUserList()">查询</a-button>
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
          <template>
            <a-tag color="orange" @click="handleEdit(record)">修改</a-tag>
            <a-popconfirm
              :title="'确认' + disableOrEnable(record.status) + '该用户吗?'"
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleDisableConfirm(record)"
              @cancel="handleConfirmCancel()"
            >
              <a-tag :color="record.status === 0 ? 'cyan' : 'green'">{{ disableOrEnable(record.status) }}</a-tag>
            </a-popconfirm>
            <a-popconfirm
              title="确认删除该用户吗?"
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleDelConfirm(record)"
              @cancel="handleConfirmCancel()"
            >
              <a-tag style="margin-right: 0" color="red">删除</a-tag>
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
import CreateForm from './modules/CreateForm'
import { createUser, updateUser, deleteUser, getPageUserList } from '@/services/user'

const columns = [
  {
    title: '账号',
    dataIndex: 'account'
  },
  {
    title: '昵称',
    dataIndex: 'nickName',
    customRender: (text) => {
      return text || '—'
    }
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
    }
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
    dataIndex: 'updateTime'
  },
  {
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
    width: 180,
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
    handleOk() {
      const createModal = this.$refs.createModal
      this.confirmLoading = true
      createModal.form.validateFields((errors, values) => {
        if (!errors) {
          if (values.id > 0) {
            // 修改 e.g.
            updateUser(values)
              .then(() => {
                this.okPostProcess(createModal)
                this.$message.success('修改成功')
              })
              .finally(() => {
                this.confirmLoading = false
              })
          } else {
            // 新增
            createUser(values)
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
      this.fetchPageUserList()
    },
    handleCancel() {
      this.visible = false
      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
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
