<template>
  <a-modal
    title="分配角色"
    :width="500"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => $emit('ok')"
    @cancel="() => $emit('cancel')"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <a-form-item v-show="false" label="用户ID">
          <a-input v-decorator="['id']" disabled />
        </a-form-item>
        <a-form-item label="用户账号">
          <a-input v-decorator="['account']" disabled />
        </a-form-item>
        <a-form-item label="用户昵称">
          <a-input v-decorator="['nickName']" disabled />
        </a-form-item>
        <a-form-item label="用户角色">
          <a-select mode="multiple" style="width: 100%" @change="onChange" v-decorator="['roleIds']">
            <a-select-option v-for="i in rolesData" :key="i.id">
              {{ i.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { getUserRoles } from '@/services/user'
import { getPageRoleList } from '@/services/role'

// 表单字段
const fields = ['id', 'account', 'nickName', 'roleIds']

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
    return {
      rolesData: null,
      form: this.$form.createForm(this)
    }
  },
  created() {
    // 防止表单未注册
    fields.forEach((v) => this.form.getFieldDecorator(v))
    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      this.model && this.form.setFieldsValue(pick(this.model, fields))
    })
    this.fetchRolesData()
    this.$watch('visible', () => {
      if (this.visible) {
        this.fetchUserRoles()
      }
    })
  },
  methods: {
    fetchRolesData() {
      getPageRoleList({ pageNo: 1, pageSize: 15 }).then((res) => {
        this.rolesData = res.data
      })
    },
    fetchUserRoles() {
      getUserRoles(this.model.id).then((res) => {
        const data = res.data
        this.form.setFieldsValue({ roleIds: data })
      })
    },
    onChange(value) {
      console.log(`selected ${value}`)
    }
  }
}
</script>
