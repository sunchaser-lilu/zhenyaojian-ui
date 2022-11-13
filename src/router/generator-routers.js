// eslint-disable-next-line
import * as loginService from '@/api/login'
// eslint-disable-next-line
import { BasicLayout, BlankLayout, PageView, RouteView } from '@/layouts'

// 前端路由表 (基于动态)
const constantRouterComponents = {
  // 基础页面 layout 必须引入
  BasicLayout: BasicLayout,
  BlankLayout: BlankLayout,
  RouteView: RouteView,
  PageView: PageView,
  '403': () => import(/* webpackChunkName: "error" */ '@/views/exception/403'),
  '404': () => import(/* webpackChunkName: "error" */ '@/views/exception/404'),
  '500': () => import(/* webpackChunkName: "error" */ '@/views/exception/500'),

  // 你需要动态引入的页面组件
  Workplace: () => import('@/views/dashboard/Workplace'),
  Analysis: () => import('@/views/dashboard/Analysis'),

  // menu
  MenuManage: () => import('@/views/system/MenuManage'),

  // form
  BasicForm: () => import('@/views/form/basicForm/Index'),
  StepForm: () => import('@/views/form/stepForm/StepForm'),
  AdvanceForm: () => import('@/views/form/advancedForm/AdvancedForm'),

  // list
  TableList: () => import('@/views/list/TableList'),
  StandardList: () => import('@/views/list/BasicList'),
  CardList: () => import('@/views/list/CardList'),
  SearchLayout: () => import('@/views/list/search/SearchLayout'),
  SearchArticles: () => import('@/views/list/search/Article'),
  SearchProjects: () => import('@/views/list/search/Projects'),
  SearchApplications: () => import('@/views/list/search/Applications'),
  ProfileBasic: () => import('@/views/profile/basic'),
  ProfileAdvanced: () => import('@/views/profile/advanced/Advanced'),

  // result
  ResultSuccess: () => import(/* webpackChunkName: "result" */ '@/views/result/Success'),
  ResultFail: () => import(/* webpackChunkName: "result" */ '@/views/result/Error'),

  // exception
  Exception403: () => import(/* webpackChunkName: "fail" */ '@/views/exception/403'),
  Exception404: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404'),
  Exception500: () => import(/* webpackChunkName: "fail" */ '@/views/exception/500'),

  // account
  AccountCenter: () => import('@/views/account/center'),
  AccountSettings: () => import('@/views/account/settings/Index'),
  BasicSetting: () => import('@/views/account/settings/BasicSetting'),
  SecuritySettings: () => import('@/views/account/settings/Security'),
  CustomSettings: () => import('@/views/account/settings/Custom'),
  BindingSettings: () => import('@/views/account/settings/Binding'),
  NotificationSettings: () => import('@/views/account/settings/Notification')

  // 'TestWork': () => import(/* webpackChunkName: "TestWork" */ '@/views/dashboard/TestWork')
}

// 前端未找到页面路由（固定不用改）
const notFoundRouter = {
  path: '*',
  redirect: '/404',
  hidden: true
}

// 根级菜单
const rootRouter = {
  key: '',
  path: '/',
  component: 'BasicLayout',
  meta: {
    title: '首页'
  },
  children: []
}

// export const generatorStaticRouter = () => {

// }

/**
 * 动态生成菜单
 * @returns {Promise<Router>}
 */
export const generatorDynamicRouter = () => {
  return new Promise((resolve, reject) => {
    loginService
      .getCurrentUserMenu()
      .then(res => {
        console.log('generatorDynamicRouter response:', res)
        const { data } = res
        rootRouter.children = data
        const dynamicRouters = configureComponent(rootRouter)
        const routers = []
        routers.push(dynamicRouters)
        routers.push(notFoundRouter)
        resolve(routers)
      })
      .catch(err => {
        reject(err)
      })
  })
}

export const configureComponent = (data) => {
  const { component, children } = data
  if (component === '') {
    data.component = undefined
    data.meta.target = '_blank'
  }
  if (component && component !== '') {
    data.name = component
    data.component = constantRouterComponents[component]
  }
  if (children && children.length > 0) {
    // Recursion
    data.children = children.map(item => {
      return configureComponent(item)
    })
    // vue-router.esm.js?3423:16 [vue-router] Named Route 'BasicLayout' has a default child route. When navigating to this named route (:to="{name: 'BasicLayout'}"), the default child route will not be rendered. Remove the name from this route and use the name of the default child route for named links instead.
    // 当存在 children 路由时，父级路由需要一个默认的路由，此时不能给父级路由设置 name
    data.name = undefined
  }
  return data
}
