import Vue from 'vue'
import Router from 'vue-router'
import { formatRoutes } from '@/utils/routerUtil'
import store from '@/store'

// https://blog.csdn.net/weixin_43242112/article/details/107595460
// hack router push callback
const originalPush = Router.prototype.push
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

export const LOGIN_PATH = '/user/login'

// 不需要登录拦截的路由配置
export const loginIgnore = {
  names: ['404', '403'], // 根据路由名称匹配
  paths: [LOGIN_PATH], // 根据路由fullPath匹配
  /**
   * 判断路由是否包含在该配置中
   * @param route vue-router 的 route 对象
   * @returns {boolean}
   */
  includes(route) {
    return this.names.includes(route.name) || this.paths.includes(route.path)
  }
}

/**
 * 初始化路由实例
 */
const initRouter = () => {
  // 是否异步路由模式
  const isAsync = store.state.setting.asyncRoutes
  const options = isAsync ? require('./async/config.async').default : require('./config').default
  formatRoutes(options.routes)
  return new Router({
    mode: 'history',
    ...options
  })
}

const router = initRouter()

// 定义一个resetRouter 方法，在退出登录后或token过期后 需要重新登录时，调用即可
export function resetRouter() {
  const newRouter = initRouter()
  router.matcher = newRouter.matcher
}

export default router
