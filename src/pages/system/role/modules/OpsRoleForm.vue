<template>
  <a-modal
    :title="model && model.id > 0 ? '修改角色' : '新建角色'"
    :width="400"
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
        <a-form-item label="角色名称">
          <a-input v-decorator="['name', { rules: [{ required: true, message: '请输入角色名称' }] }]" />
        </a-form-item>
        <a-form-item>
          <span slot="label">
            显示排序
            <a-tooltip title="数值越小越靠前~">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input-number v-decorator="['sortValue', { initialValue: 0 }]" :min="0" :max="9999" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'

// 表单字段
const fields = ['id', 'name', 'sortValue']

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
  }
}
</script>
