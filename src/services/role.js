import { ROLE, ROLES } from '@/services/api'
import { request, METHOD } from '@/utils/request'

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
