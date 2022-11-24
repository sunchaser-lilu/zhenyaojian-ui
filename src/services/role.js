import { request, METHOD } from '@/utils/request'
import { ROLE, ROLES, ROLE_PERMISSION, PERMISSION } from './api'

const { GET, POST, PATCH, DELETE } = METHOD

export function createRole(parameter) {
  return request({
    url: ROLE,
    method: POST,
    data: parameter
  })
}

export function updateRole(parameter) {
  return request({
    url: ROLE,
    method: PATCH,
    data: parameter
  })
}

export function getPageRoleList(parameter) {
  return request({
    url: ROLES,
    method: GET,
    params: parameter
  })
}

export function deleteRole(parameter) {
  return request({
    url: `${ROLE}/${parameter}`,
    method: DELETE
  })
}

export function assignRolePermission(parameter) {
  return request({
    url: ROLE_PERMISSION,
    method: POST,
    data: parameter
  })
}

export function getRolePermissions(parameter) {
  return request({
    url: `${ROLE}/${parameter}${PERMISSION}`,
    method: GET
  })
}
