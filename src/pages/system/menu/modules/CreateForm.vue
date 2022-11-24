<template>
  <a-modal
    :title="model && model.id > 0 ? '修改菜单' : '新建菜单'"
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
        <a-form-item label="菜单名称">
          <a-input v-decorator="['name', { rules: [{ required: true, message: '请输入菜单名称' }] }]" />
        </a-form-item>
        <a-form-item label="菜单类型">
          <a-radio-group
            name="radioGroup"
            @change="onMenuTypeChange"
            v-decorator="['type', { rules: [{ required: true, message: '请选择菜单类型' }] }]"
          >
            <a-radio value="0" :disabled="catalogRadioDisabled">目录</a-radio>
            <a-radio value="1" :disabled="menuRadioDisabled">菜单</a-radio>
            <a-radio value="2">按钮</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="上级菜单">
          <a-tree-select
            show-search
            treeNodeFilterProp="title"
            @select="onParentMenuSelect"
            :tree-data="permissionsTree"
            :replace-fields="replaceFields"
            :disabled="parentMenuDisabled"
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
            前端组件名
            <a-tooltip title="前端页面组件的名称">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input v-decorator="['component']" :disabled="componentDisabled" />
        </a-form-item>
        <a-form-item>
          <span slot="label">
            权限标识
            <a-tooltip title="后端鉴权需要的权限标识">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input v-decorator="['permission']" />
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
import { getPermissionTree } from '@/services/menu'
import IconPicker from '@/components/IconPicker'

// 表单字段
const fields = ['id', 'name', 'type', 'parentId', 'path', 'component', 'permission', 'sortValue', 'icon']

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
      // 是否展示路由地址表单项
      showPath: true,
      // 是否展示前端组件名表单项
      showComponet: true,
      // 是否展示排序表单项
      showSortValue: true,
      // 是否禁用上级菜单表单项
      parentMenuDisabled: false,
      // 是否禁用前端组件名表单项
      componentDisabled: false,
      // 是否禁用目录类型的 radio
      catalogRadioDisabled: false,
      // 是否禁用菜单类型的 radio
      menuRadioDisabled: false,
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
    this.fetchPermissionTree()
  },
  methods: {
    // 处理联动
    handleAddLinkage(record) {
      if (record?.id && record?.id !== 0) {
        // 从表格列点击添加，只能添加当前列下的子菜单
        // 禁用上级菜单
        this.parentMenuDisabled = true
      }
      /**
       * 目录下添加子菜单：可添加任意类型菜单
       * 菜单下添加子菜单：只可添加按钮（禁用目录和菜单 Radio）
       * 按钮无添加子菜单按钮
       */
      if (record?.type === 1) {
        // 从菜单列点击添加，只允许添加按钮
        // 禁用目录和菜单 radio，默认选中按钮 radio
        this.catalogRadioDisabled = true
        this.menuRadioDisabled = true
        this.form.setFieldsValue({ type: '2' })
        // 触发 radio 切换事件
        this.onMenuTypeChange({ target: { value: '2' } })
      } else {
        // 其它情况添加无限制
        this.initFormStatus()
      }
    },
    handleEditLinkage(record) {
      // 取消禁用上级菜单
      this.parentMenuDisabled = false
      // 取消禁用 radio
      this.catalogRadioDisabled = false
      this.menuRadioDisabled = false
      // 触发 radio 切换事件
      const t = record.type
      this.form.setFieldsValue({ type: t })
      this.onMenuTypeChange({ target: { value: t } })
    },
    initFormStatus() {
      this.catalogRadioDisabled = false
      this.menuRadioDisabled = false
      this.showPath = true
      this.showComponet = true
      this.showSortValue = true
      this.componentDisabled = false
      this.form.setFieldsValue({ component: '', type: '' })
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
      if (value === '0') {
        // 切换到目录
        this.showPath = true
        this.showComponet = true
        this.showSortValue = true
        // 禁用 component，值固定为 BlankView
        this.componentDisabled = true
        this.form.setFieldsValue({ component: 'BlankView' })
        this.filter = FILTER_CATALOG
      } else if (value === '1') {
        // 切换到菜单
        this.showPath = true
        this.showComponet = true
        this.showSortValue = true
        this.componentDisabled = false
        this.form.setFieldsValue({ component: '' })
        this.filter = FILTER_CATALOG
      } else if (value === '2') {
        // 切换到按钮
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
