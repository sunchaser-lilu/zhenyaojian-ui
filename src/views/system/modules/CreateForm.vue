<template>
  <a-modal
    title="新建菜单"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => $emit('ok')"
    @cancel="() => $emit('cancel')"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <!-- 检查是否有 id 并且大于0，大于0是修改。其他是新增，新增不显示主键ID -->
        <a-form-item v-show="model && model.id > 0" label="主键ID">
          <a-input v-decorator="['id', { initialValue: 0 }]" disabled />
        </a-form-item>
        <a-form-item label="菜单名称">
          <a-input v-decorator="['name', { rules: [{ required: true, message: '请输入菜单名称' }] }]" />
        </a-form-item>
        <a-form-item label="菜单类型">
          <a-radio-group
            name="radioGroup"
            v-decorator="['type', { rules: [{ required: true, message: '请选择菜单类型' }] }]"
          >
            <a-radio :value="0"> 目录 </a-radio>
            <a-radio :value="1"> 菜单 </a-radio>
            <a-radio :value="2"> 按钮 </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="上级菜单">
          <a-tree show-line :default-expanded-keys="['0-0-0']" @select="onSelect">
            <a-icon slot="switcherIcon" type="down" />
            <a-tree-node key="0-0" title="parent 1">
              <a-tree-node key="0-0-0" title="parent 1-0">
                <a-tree-node key="0-0-0-0" title="leaf" />
                <a-tree-node key="0-0-0-1" title="leaf" />
                <a-tree-node key="0-0-0-2" title="leaf" />
              </a-tree-node>
              <a-tree-node key="0-0-1" title="parent 1-1">
                <a-tree-node key="0-0-1-0" title="leaf" />
              </a-tree-node>
              <a-tree-node key="0-0-2" title="parent 1-2">
                <a-tree-node key="0-0-2-0" title="leaf" />
                <a-tree-node key="0-0-2-1" title="leaf" />
              </a-tree-node>
            </a-tree-node>
          </a-tree>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'

// 表单字段
const fields = ['description', 'id']

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
    console.log('custom modal created')

    // 防止表单未注册
    fields.forEach((v) => this.form.getFieldDecorator(v))

    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      this.model && this.form.setFieldsValue(pick(this.model, fields))
    })
  },
  methods: {
    onSelect(selectedKeys, info) {
      console.log('selected', selectedKeys, info)
    }
  }
}
</script>
