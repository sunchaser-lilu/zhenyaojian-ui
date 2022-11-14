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
            @change="onMenuTypeChange"
            v-decorator="['type', { rules: [{ required: true, message: '请选择菜单类型' }] }]"
          >
            <a-radio :value="0" :disabled="catalogRadioDisabled"> 目录 </a-radio>
            <a-radio :value="1" :disabled="menuRadioDisabled"> 菜单 </a-radio>
            <a-radio :value="2"> 按钮 </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="上级菜单">
          <a-tree-select
            show-search
            treeNodeFilterProp="title"
            @select="onParentMenuSelect"
            :tree-data="permissionsTree"
            :replace-fields="replaceFields"
            tree-default-expand-all
            v-decorator="[
              'parentId',
              { initialValue: ['0'] },
              { rules: [{ required: true, message: '请选择上级菜单' }] }
            ]"
          >
          </a-tree-select>
        </a-form-item>
        <a-form-item v-show="showPath">
          <span slot="label">
            路由地址
            <a-tooltip title="您要去往何方?">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input v-decorator="['path']" />
        </a-form-item>
        <a-form-item v-show="showComponet">
          <span slot="label">
            前端组件
            <a-tooltip title="前端页面组件的名称">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input v-decorator="['component']" :disabled="componentDisabled" />
        </a-form-item>
        <a-form-item v-show="showSortValue">
          <span slot="label">
            显示排序
            <a-tooltip title="数值越小越靠前~">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input-number v-decorator="['sortValue', { initialValue: 0 }]" :min="0" :max="9999" />
        </a-form-item>
        <a-form-item label="图标">
          <icon-picker
            placeholder="请选择一个图标"
            v-bind="iconOptions"
            v-decorator="['icon', { initialValue: null }]"
          ></icon-picker>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { getPermissionTree } from '@/api/menu'
import IconPicker from '@/components/IconPicker'

// 表单字段
const fields = ['id', 'name', 'type', 'parentId', 'path', 'component', 'sortValue', 'icon']

const ROOT_MENU = {
  id: 0,
  parentId: 0,
  name: '主目录'
}

const FILTER_MENU = 'FILTER_MENU'
const FILTER_CATALOG = 'FILTER_CATALOG'

export default {
  components: {
    IconPicker
  },
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
    },
    onlyBtnType: {
      type: Boolean,
      default: () => false
    },
    addFlag: {
      type: Boolean,
      default: () => false
    },
    updateFlag: {
      type: Boolean,
      default: () => false
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
      filter: FILTER_CATALOG,
      permissionsTree: null,
      // Tree 组件和后端字段的映射替换
      replaceFields: {
        title: 'name',
        key: 'id',
        value: 'id'
      },
      // 图标选择器默认 Tab
      currentSelectedIcon: 'pause-circle',
      // 图标选择器配置项
      iconOptions: {
        disabled: false,
        allowClear: true
      },
      showPath: false,
      showComponet: true,
      showSortValue: true,
      componentDisabled: false,
      catalogRadioDisabled: false,
      menuRadioDisabled: false,
      form: this.$form.createForm(this)
    }
  },
  created() {
    this.fetchPermissionTree()
    // 防止表单未注册
    fields.forEach((v) => this.form.getFieldDecorator(v))
    /**
     * 目录下添加子菜单：可添加任意类型菜单
     * 菜单下添加子菜单：只可添加按钮（禁用目录和菜单 Radio）
     * 按钮无添加子菜单按钮
     */
    this.$watch('addFlag', () => {
      if (this.onlyBtnType) {
        this.catalogRadioDisabled = true
        this.menuRadioDisabled = true
        this.form.setFieldsValue({ type: 2 })
        this.onMenuTypeChange({ target: { value: 2 } })
      } else {
        this.initFormStatus()
      }
    })
    this.$watch('updateFlag', () => {
      this.catalogRadioDisabled = false
      this.menuRadioDisabled = false
      this.showPath = this.model.type === 1
      this.showComponet = true
      this.showSortValue = true
      this.componentDisabled = this.model.type === 0
    })
    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      this.model && this.form.setFieldsValue(pick(this.model, fields))
    })
  },
  methods: {
    initFormStatus() {
      this.catalogRadioDisabled = false
      this.menuRadioDisabled = false
      this.showPath = false
      this.showComponet = true
      this.showSortValue = true
      this.componentDisabled = false
      this.form.getFieldDecorator('component', { initialValue: '' })
    },
    onParentMenuSelect(selectedKeys, info) {
      console.log('selected', selectedKeys, info)
    },
    fetchPermissionTree() {
      getPermissionTree({ filter: this.filter }).then((res) => {
        this.permissionsTree = res.data
        // 插入到数组开头
        this.permissionsTree.unshift(ROOT_MENU)
      })
    },
    onMenuTypeChange(event) {
      const value = event.target.value
      if (value === 0) {
        console.log(this.model)
        // 切换到目录
        this.showPath = false
        this.showComponet = true
        this.showSortValue = true
        this.componentDisabled = true
        this.form.getFieldDecorator('component', { initialValue: 'RouteView' })
        this.catalogRadioDisabled = false
        this.menuRadioDisabled = false
        this.filter = FILTER_CATALOG
      } else if (value === 1) {
        // 切换到菜单
        this.showPath = true
        this.showComponet = true
        this.showSortValue = true
        this.componentDisabled = false
        this.form.getFieldDecorator('component', { initialValue: '' })
        this.filter = FILTER_CATALOG
      } else if (value === 2) {
        // 按钮
        this.showPath = false
        this.showComponet = false
        this.showSortValue = false
        this.filter = FILTER_MENU
      }
      this.fetchPermissionTree()
    }
  }
}
</script>
