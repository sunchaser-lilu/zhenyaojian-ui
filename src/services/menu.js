import { PERMISSION, PERMISSIONS, PERMISSION_TREE } from '@/services/api'
import { request, METHOD } from '@/utils/request'

const { GET, POST, PATCH, DELETE } = METHOD

export function getPermissionTree(parameter) {
  return request({
    url: PERMISSION_TREE,
    method: GET,
    params: parameter
  })
}

export function createPermission(parameter) {
  return request({
    url: PERMISSION,
    method: POST,
    data: parameter
  })
}

export function updatePermission(parameter) {
  return request({
    url: PERMISSION,
    method: PATCH,
    data: parameter
  })
}

export function getPermissionList(parameter) {
  return request({
    url: PERMISSIONS,
    method: GET,
    params: parameter
  })
}

export function deletePermission(parameter) {
  return request({
    url: `${PERMISSION}/${parameter}`,
    method: DELETE
  })
}
