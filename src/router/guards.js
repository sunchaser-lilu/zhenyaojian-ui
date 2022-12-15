// import { hasAuthority } from '@/utils/authority-utils'
import { ACCESS_TOKEN } from '@/utils/request'
import { loginIgnore, resetRouter, LOGIN_PATH } from '@/router/index'
import NProgress from 'nprogress'
import storage from 'store'
import { getUserRouter } from '@/services/user'
import { loadRoutes } from '@/utils/routerUtil'

NProgress.configure({ showSpinner: false })

/**
 * 进度条开始
 * @param to
 * @param form
 * @param next
 */
const progressStart = (to, from, next) => {
  // start progress bar
  if (!NProgress.isStarted()) {
    NProgress.start()
  }
  next()
}

/**
 * 登录守卫
 * @param to
 * @param form
 * @param next
 * @param options
 */
const loginGuard = (to, from, next, options) => {
  const { store, notification } = options
  // 从 localstorage 获取 token
  const token = storage.get(ACCESS_TOKEN)
  if (token) {
    if (to.path === LOGIN_PATH) {
      next({ path: '/' })
      NProgress.done()
    } else {
      store.dispatch('account/GetUser')
        .then(() => {
          if (store.getters['setting/menuData'].length === 0) {
            getUserRouter().then(res => {
              // VueRouter@3.5.0+ New API
              resetRouter() // 重置路由 防止退出重新登录或者 token 过期后页面未刷新，导致的路由重复添加
              loadRoutes(res.data)
              // 请求带有 redirect 重定向时，登录自动重定向到该地址
              const redirect = decodeURIComponent(from.query.redirect || to.path)
              if (to.path === redirect) {
                // set the replace: true so the navigation will not leave a history record
                next({ ...to, replace: true })
              } else {
                // 跳转到目的路由
                next({ path: redirect })
              }
            })
          } else {
            next()
          }
        })
        .catch((err) => {
          console.log(err)
          notification.error({
            message: '错误',
            description: '请求用户信息失败，请重试'
          })
          // 失败时，获取用户信息失败时，调用登出，来清空历史保留信息
          // store.dispatch('Logout').then(() => {
          //   next({ path: LOGIN_PATH, query: { redirect: to.fullPath } })
          // })
        })
    }
  } else {
    if (loginIgnore.includes(to)) {
      // 免登录拦截，直接进入
      next()
    } else {
      next({ path: LOGIN_PATH, query: { redirect: to.fullPath } })
    }
  }
}

/**
 * 权限守卫
 * @param to
 * @param form
 * @param next
 * @param options
 */
// const authorityGuard = (to, from, next, options) => {
//   const { store, message } = options
//   const permissions = store.getters['account/permissions']
//   const roles = store.getters['account/roles']
//   if (!hasAuthority(to, permissions, roles)) {
//     message.warning(`对不起，您无权访问页面: ${to.fullPath}，请联系管理员`)
//     next({ path: '/403' })
//     // NProgress.done()
//   } else {
//     next()
//   }
// }

/**
 * 混合导航模式下一级菜单跳转重定向
 * @param to
 * @param from
 * @param next
 * @param options
 * @returns {*}
 */
// const redirectGuard = (to, from, next, options) => {
//   const { store } = options
//   const getFirstChild = (routes) => {
//     const route = routes[0]
//     if (!route.children || route.children.length === 0) {
//       return route
//     }
//     return getFirstChild(route.children)
//   }
//   if (store.state.setting.layout === 'mix') {
//     const firstMenu = store.getters['setting/firstMenu']
//     if (firstMenu.find(item => item.fullPath === to.fullPath)) {
//       store.commit('setting/setActivatedFirst', to.fullPath)
//       const subMenu = store.getters['setting/subMenu']
//       if (subMenu.length > 0) {
//         const redirect = getFirstChild(subMenu)
//         return next({ path: redirect.fullPath })
//       }
//     }
//   }
//   next()
// }

/**
 * 进度条结束
 * @param to
 * @param form
 * @param options
 */
const progressDone = () => {
  // finish progress bar
  NProgress.done()
}

export default {
  beforeEach: [progressStart, loginGuard],
  afterEach: [progressDone]
}
