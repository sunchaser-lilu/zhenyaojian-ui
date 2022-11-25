<template>
  <a-modal
    title="赋予权限"
    :width="500"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => $emit('ok')"
    @cancel="() => $emit('cancel')"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <a-form-item v-show="false" label="角色ID">
          <a-input v-decorator="['id']" disabled />
        </a-form-item>
        <a-form-item label="角色名称">
          <a-input v-decorator="['name']" disabled />
        </a-form-item>
        <a-form-item label="菜单权限">
          <a-checkbox @change="onChange">全选/全不选</a-checkbox>
          <a-divider />
          <a-tree
            v-decorator="['permissionIds']"
            checkable
            checkStrictly
            :selectable="false"
            v-model="checkedKeys"
            :replace-fields="replaceFields"
            :tree-data="treeData"
            @check="onCheck"
            :defaultExpandAll="true"
          />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { getPermissionList } from '@/services/menu'
import { getRolePermissions } from '@/services/role'

// 表单字段
const fields = ['id', 'name', 'permissionIds']

export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      default: () => false
    },
    model: {
      type: Object,
      default: () => null
    }
  },
  data() {
    this.formLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      }
    }
    // Tree 组件和后端字段的映射替换
    this.replaceFields = {
      title: 'name',
      key: 'id',
      value: 'id'
    }
    return {
      form: this.$form.createForm(this),
      checkedKeys: [],
      treeData: null
    }
  },
  created() {
    // 防止表单未注册
    fields.forEach((v) => this.form.getFieldDecorator(v))
    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      this.model && this.form.setFieldsValue(pick(this.model, fields))
    })
    this.fetchTreeData()
    this.$watch('visible', () => {
      if (this.visible) {
        this.fetchRolePermissions()
      }
    })
  },
  methods: {
    fetchTreeData() {
      getPermissionList().then((res) => {
        this.treeData = res.data
      })
    },
    fetchRolePermissions() {
      getRolePermissions(this.model.id).then((res) => {
        const data = res.data
        this.checkedKeys = data
        this.form.setFieldsValue({ permissionIds: data })
      })
    },
    onChange(e) {
      if (e.target.checked) {
        const checkedData = []
        this.loopChecked(checkedData, this.treeData)
        this.checkedKeys = checkedData
        this.form.setFieldsValue({ permissionIds: checkedData })
      } else {
        this.checkedKeys = []
        this.form.setFieldsValue({ permissionIds: [] })
      }
    },
    loopChecked(checkedData, data) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        checkedData.push(item.id)
        if (item.children) {
          this.loopChecked(checkedData, item.children)
        }
      }
    },
    onCheck(checkedKeys) {
      console.log('onCheck', checkedKeys)
      const checked = checkedKeys.checked
      this.checkedKeys = checked
      this.form.setFieldsValue({ permissionIds: checked })
    }
  }
}
</script>

<style lang="less" scoped>
.ant-divider-horizontal {
  margin: 0 0;
}
</style>
