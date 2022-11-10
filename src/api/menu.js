import request from '@/utils/request'

const api = {
  permission: '/permission',
  permissionTree: '/permissions/tree'
}

export default api

export function getPermissionTree(parameter) {
  return request({
    url: api.permissionTree,
    method: 'get',
    params: parameter
  })
}

export function createPermission(parameter) {
  return request({
    url: api.permission,
    method: 'post',
    data: parameter
  })
}
