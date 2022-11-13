import request from '@/utils/request'

const api = {
  permission: '/permission',
  permissions: '/permissions',
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

export function updatePermission(parameter) {
  return request({
    url: api.permission,
    method: 'patch',
    data: parameter
  })
}

export function getPermissionList(parameter) {
  return request({
    url: api.permissions,
    method: 'get',
    params: parameter
  })
}

export function deletePermission(parameter) {
  return request({
    url: `${api.permission}/${parameter}`,
    method: 'delete'
  })
}
