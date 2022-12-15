import routerMap from '@/router/async/router.map'
import routerComponents from '@/router/async/router.components'
import { mergeI18nFromRoutes } from '@/utils/i18n'
import Router from 'vue-router'
import deepMerge from 'deepmerge'
import basicOptions from '@/router/async/config.async'

// 应用配置
const appOptions = {
  router: undefined,
  i18n: undefined,
  store: undefined
}

/**
 * 设置应用配置
 * @param options
 */
function setAppOptions(options) {
  const { router, store, i18n } = options
  appOptions.router = router
  appOptions.store = store
  appOptions.i18n = i18n
}

/**
 * 根据 路由配置 和 路由组件注册 解析路由
 * @param routesConfig 外部路由配置（可由接口返回）
 * @param routerMap 本地路由组件注册配置
 */
function parseRoutes(routesConfig, routerMap) {
  const routes = []
  routesConfig.forEach(item => {
    // 获取注册在 routerMap 中的 router，初始化 routeCfg
    let router
    let routeCfg
    if (typeof item === 'string') {
      router = routerMap[item]
      routeCfg = { path: (router && router.path) || item, router: item }
    } else if (typeof item === 'object') {
      router = routerMap[item.router]
      routeCfg = item
    }
    if (!router) {
      console.warn(`can't find register for router ${routeCfg.router}, please register it in advance.`)
      router = typeof item === 'string' ? { path: item, name: item } : item
    }
    // 从 router 和 routeCfg 解析路由
    const meta = {
      authority: router.authority,
      icon: router.icon,
      page: router.page,
      link: router.link,
      params: router.params,
      query: router.query,
      ...router.meta
    }
    const cfgMeta = {
      authority: routeCfg.authority,
      icon: routeCfg.icon,
      page: routeCfg.page,
      link: routeCfg.link,
      params: routeCfg.params,
      query: routeCfg.query,
      ...routeCfg.meta
    }
    Object.keys(cfgMeta).forEach(key => {
      if (cfgMeta[key] === undefined || cfgMeta[key] === null || cfgMeta[key] === '') {
        delete cfgMeta[key]
      }
    })
    Object.assign(meta, cfgMeta)
    const route = {
      path: routeCfg.path || router.path || routeCfg.router,
      // name 或者 meta.title
      name: routeCfg.name || router.name || router?.meta?.title || routeCfg?.meta?.title,
      // 如果 router.component 后台接口返回的 string 则转化为对应组件，默认路由到 BlankView 空白视图
      component: (typeof router.component === 'string' ? routerComponents[router.component] : router.component) || routerComponents[routeCfg.component] || routerComponents['BlankView'],
      redirect: routeCfg.redirect || router.redirect,
      meta: { ...meta, authority: meta.authority || '*' }
    }
    if (route.component === '') {
      route.meta.target = '_blank'
    }
    Object.keys(route).forEach(key => {
      if (route[key] === undefined || route[key] === null || route[key] === '') {
        delete route[key]
      }
    })
    if (routeCfg.invisible || router.invisible) {
      route.meta.invisible = true
    }
    if (routeCfg.children && routeCfg.children.length > 0) {
      route.children = parseRoutes(routeCfg.children, routerMap)
    }
    routes.push(route)
  })
  return routes
}

// 前端未找到页面路由（固定不用改）
const notFoundRouter = {
  path: '*',
  redirect: '/404',
  hidden: true
}

// 根级菜单
const rootRouter = {
  path: '/',
  component: 'Tabs',
  meta: {
    title: '首页'
  },
  children: null
}

/**
 * 加载路由
 * @param routesConfig {RouteConfig[]} 路由配置
 */
function loadRoutes(routesConfig) {
  // 应用配置
  const { router, store, i18n } = appOptions

  // 如果 routesConfig 有值，则更新到本地，否则从本地获取
  if (routesConfig) {
    store.commit('account/setRoutesConfig', routesConfig)
  } else {
    routesConfig = store.getters['account/routesConfig']
  }
  // 如果开启了异步路由，则加载异步路由配置
  const asyncRoutes = store.state.setting.asyncRoutes
  if (asyncRoutes) {
    if (routesConfig && routesConfig.length > 0) {
      rootRouter.children = routesConfig
      const routes = parseRoutes([rootRouter], routerMap)
      const finalRoutes = mergeRoutes(basicOptions.routes, routes)
      formatRoutes(finalRoutes)
      router.options = { ...router.options, routes: finalRoutes }
      router.matcher = new Router({ ...router.options, routes: [] }).matcher
      router.addRoutes(finalRoutes)
    }
  }
  const routes = router.options.routes
  // 提取路由国际化数据
  mergeI18nFromRoutes(i18n, routes)
  // 初始化Admin后台菜单数据
  const rootRoute = routes.find(item => item.path === '/')
  const menuRoutes = rootRoute && rootRoute.children
  if (menuRoutes) {
    store.commit('setting/setMenuData', menuRoutes)
  }
}

/**
 * 合并路由
 * @param target {Route[]}
 * @param source {Route[]}
 * @returns {Route[]}
 */
function mergeRoutes(target, source) {
  const routesMap = {}
  target.forEach(item => { routesMap[item.path] = item })
  source.forEach(item => { routesMap[item.path] = item })
  routesMap[notFoundRouter.path] = notFoundRouter
  return Object.values(routesMap)
}

/**
 * 深度合并路由
 * @param target {Route[]}
 * @param source {Route[]}
 * @returns {Route[]}
 */
function deepMergeRoutes(target, source) {
  // 映射路由数组
  const mapRoutes = routes => {
    const routesMap = {}
    routes.forEach(item => {
      routesMap[item.path] = {
        ...item,
        children: item.children ? mapRoutes(item.children) : undefined
      }
    })
    return routesMap
  }
  const tarMap = mapRoutes(target)
  const srcMap = mapRoutes(source)

  // 合并路由
  const merge = deepMerge(tarMap, srcMap)

  // 转换为 routes 数组
  const parseRoutesMap = routesMap => {
    return Object.values(routesMap).map(item => {
      if (item.children) {
        item.children = parseRoutesMap(item.children)
      } else {
        delete item.children
      }
      return item
    })
  }
  return parseRoutesMap(merge)
}

/**
 * 格式化路由
 * @param routes 路由配置
 */
function formatRoutes(routes) {
  routes.forEach(route => {
    const { path } = route
    if (!path.startsWith('/') && path !== '*') {
      route.path = '/' + path
    }
  })
  formatAuthority(routes)
}

/**
 * 格式化路由的权限配置
 * @param routes 路由
 * @param pAuthorities 父级路由权限配置集合
 */
function formatAuthority(routes, pAuthorities = []) {
  routes.forEach(route => {
    const meta = route.meta
    const defaultAuthority = pAuthorities[pAuthorities.length - 1] || { permission: '*' }
    if (meta) {
      let authority = {}
      if (!meta.authority) {
        authority = defaultAuthority
      } else if (typeof meta.authority === 'string') {
        authority.permission = meta.authority
      } else if (typeof meta.authority === 'object') {
        authority = meta.authority
        const { role } = authority
        if (typeof role === 'string') {
          authority.role = [role]
        }
        if (!authority.permission && !authority.role) {
          authority = defaultAuthority
        }
      }
      meta.authority = authority
    } else {
      const authority = defaultAuthority
      route.meta = { authority }
    }
    route.meta.pAuthorities = pAuthorities
    if (route.children) {
      formatAuthority(route.children, [...pAuthorities, route.meta.authority])
    }
  })
}

/**
 * 从路由 path 解析 i18n key
 * @param path
 * @returns {*}
 */
function getI18nKey(path) {
  const keys = path.split('/').filter(item => !item.startsWith(':') && item !== '')
  keys.push('name')
  return keys.join('.')
}

/**
 * 加载导航守卫
 * @param guards
 * @param options
 */
function loadGuards(guards, options) {
  const { beforeEach, afterEach } = guards
  const { router } = options
  beforeEach.forEach(guard => {
    if (guard && typeof guard === 'function') {
      router.beforeEach((to, from, next) => guard(to, from, next, options))
    }
  })
  afterEach.forEach(guard => {
    if (guard && typeof guard === 'function') {
      router.afterEach((to, from) => guard(to, from, options))
    }
  })
}

export { parseRoutes, loadRoutes, formatAuthority, getI18nKey, loadGuards, deepMergeRoutes, formatRoutes, setAppOptions }
