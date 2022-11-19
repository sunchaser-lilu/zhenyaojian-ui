<template>
  <a-modal
    title="新增用户"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => $emit('ok')"
    @cancel="() => $emit('cancel')"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <!-- 检查是否有 id 并且大于0，大于0是修改。其他是新增，新增不显示主键ID -->
        <a-form-item v-show="false" label="主键ID">
          <a-input v-decorator="['id', { initialValue: 0 }]" disabled />
        </a-form-item>
        <a-form-item label="登录账号">
          <a-input v-decorator="['account', { rules: [{ required: true, message: '请输入登录账号' }] }]">
            <a-icon slot="prefix" type="user" />
          </a-input>
        </a-form-item>
        <a-form-item v-if="!model" label="登录密码">
          <a-input-password v-decorator="['password', { rules: [{ required: true, message: '请输入登录密码' }] }]">
            <a-icon slot="prefix" type="lock" />
          </a-input-password>
        </a-form-item>
        <a-form-item label="用户昵称">
          <a-input v-decorator="['nickName']" />
        </a-form-item>
        <a-form-item label="电话号码">
          <a-input v-decorator="['phoneNumber']">
            <a-select slot="addonBefore" v-decorator="['prefix', { initialValue: '86' }]" style="width: 70px">
              <a-select-option value="86">+86</a-select-option>
            </a-select>
          </a-input>
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input
            v-decorator="[
              'email',
              {
                rules: [
                  {
                    type: 'email',
                    message: '邮箱格式不正确'
                  }
                ]
              }
            ]"
          >
            <a-icon slot="prefix" type="mail" />
          </a-input>
        </a-form-item>
        <a-form-item label="性别">
          <a-radio-group name="radioGroup" v-decorator="['sex']">
            <a-radio value="男">男</a-radio>
            <a-radio value="女">女</a-radio>
            <a-radio value="未知">未知</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="所属部门">
          <a-tree-select
            show-search
            treeNodeFilterProp="title"
            @select="onDepartmentSelect"
            :tree-data="departmentsTree"
            :replace-fields="replaceFields"
            tree-default-expand-all
            v-decorator="['departmentId']"
          >
          </a-tree-select>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'

// 表单字段
const fields = ['id', 'account', 'password', 'nickName', 'phoneNumber', 'email', 'sex', 'departmentId']

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
      departmentsTree: null,
      // Tree 组件和后端字段的映射替换
      replaceFields: {
        title: 'name',
        key: 'id',
        value: 'id'
      },
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
  },
  methods: {
    onDepartmentSelect(selectedKeys, info) {
      console.log('selected', selectedKeys, info)
    }
  }
}
</script>

<style lang="less" scoped>
.anticon {
  color: rgba(0, 0, 0, 0.25);
}
</style>
