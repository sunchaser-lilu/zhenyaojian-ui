// 跨域代理前缀
// const API_PROXY_PREFIX = '/zyj/admin'
// const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_API_BASE_URL : API_PROXY_PREFIX
module.exports = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  USER_ROUTER: '/user/router',
  USER_INFO: '/user/info',
  USER: '/user',
  USERS: '/users',

  ROLE: '/role',
  ROLES: '/roles',

  PERMISSION: '/permission',
  PERMISSIONS: '/permissions',
  PERMISSION_TREE: '/permissions/tree',

  USER_ROLE: '/user/role',
  ROLE_PERMISSION: '/role/permission',

  ROUTES: '/routes'
}
