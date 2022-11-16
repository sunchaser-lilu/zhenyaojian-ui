<template>
  <page-layout>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="24">
            <a-col :md="8" :sm="24">
              <a-form-item label="菜单名称">
                <a-input v-model="queryParam.id" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="fetchPermissionList()">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => (this.queryParam = {})">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd()">新建</a-button>
      </div>

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
      >
        <!-- :expandIcon="expandIcon" -->
        <span slot="name" slot-scope="text, record">
          <a-icon :type="record.icon" />&nbsp;
          {{ text }}
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a-tag color="cyan" @click="handleAdd(record)"> 添加 </a-tag>
            <a-tag color="orange" @click="handleEdit(record)"> 修改 </a-tag>
            <a-popconfirm
              title="确认删除该条记录吗?"
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleDelConfirm(record)"
              @cancel="handleDelCancel(record)"
            >
              <a-tag style="margin-right: 0" color="red"> 删除 </a-tag>
            </a-popconfirm>
          </template>
        </span>
      </a-table>

      <create-form
        ref="createModal"
        :visible="visible"
        :loading="confirmLoading"
        :model="mdl"
        :onlyBtnType="onlyBtnType"
        :addFlag="addFlag"
        :updateFlag="updateFlag"
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

const columns = [
  {
    title: '菜单名称',
    dataIndex: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    title: '路由地址',
    dataIndex: 'path'
  },
  {
    title: '前端组件',
    dataIndex: 'component'
  },
  {
    title: '排序',
    dataIndex: 'sortValue'
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
      // create form 联动
      onlyBtnType: false,
      addFlag: false,
      updateFlag: false,
      // 表格数据
      data: null,
      // 表格加载
      loading: false
    }
  },
  created() {
    this.fetchPermissionList()
  },
  methods: {
    fetchPermissionList(parameter) {
      this.loading = true
      const requestParameters = Object.assign({}, parameter, this.queryParam)
      getPermissionList(requestParameters)
        .then((res) => {
          this.data = res.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleAdd(record) {
      this.visible = true
      this.mdl = {
        // 菜单下只能添加按钮
        type: record && record.type === 1 ? 2 : undefined,
        // 默认选择父级菜单
        parentId: record ? record.id : '0'
      }
      this.addFlag = !this.addFlag
      this.onlyBtnType = record && record.type === 1
    },
    handleEdit(record) {
      this.visible = true
      this.mdl = { ...record }
      this.updateFlag = !this.updateFlag
    },
    handleOk() {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          if (values.id > 0) {
            // 修改 e.g.
            updatePermission(values)
              .then(() => {
                this.visible = false
                this.confirmLoading = false
                // 重置表单数据
                form.resetFields()
                // 刷新表格
                this.fetchPermissionList()
                this.$message.success('修改成功')
              })
              .finally(() => {
                this.confirmLoading = false
                this.$refs.createModal.fetchPermissionTree()
              })
          } else {
            // 新增
            createPermission(values)
              .then(() => {
                this.visible = false
                this.confirmLoading = false
                // 重置表单数据
                form.resetFields()
                // 刷新表格
                this.fetchPermissionList()
                this.$message.success('新增成功')
              })
              .finally(() => {
                this.confirmLoading = false
                this.$refs.createModal.fetchPermissionTree()
              })
          }
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleCancel() {
      this.visible = false
      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handleDelConfirm(record) {
      deletePermission(record.id).then(() => {
        // 刷新表格
        this.fetchPermissionList()
        this.$message.success('删除成功')
      })
    },
    handleDelCancel() {
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
