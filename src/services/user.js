import { request, METHOD } from '@/utils/request'
import { LOGIN, LOGOUT, USER_ROUTER, USER_INFO, USER, USERS, ROLE, USER_ROLE, ROUTES } from './api'

const { GET, POST, PATCH, DELETE } = METHOD

/**
 * 登录服务
 * @param name 账户名
 * @param password 账户密码
 * @returns {Promise<AxiosResponse<T>>}
 */
export function login(parameter) {
  return request({
    url: LOGIN,
    method: POST,
    data: parameter
  })
}

export function getUserRouter() {
  return request({
    url: USER_ROUTER,
    method: GET
  })
}

export function getUserInfo() {
  return request({
    url: USER_INFO,
    method: GET
  })
}

export function logout() {
  return request({
    url: LOGOUT,
    method: POST
  })
}

export function createUser(parameter) {
  return request({
    url: USER,
    method: POST,
    data: parameter
  })
}

export function updateUser(parameter) {
  return request({
    url: USER,
    method: PATCH,
    data: parameter
  })
}

export function getPageUserList(parameter) {
  return request({
    url: USERS,
    method: GET,
    params: parameter
  })
}

export function deleteUser(parameter) {
  return request({
    url: `${USER}/${parameter}`,
    method: DELETE
  })
}

export function assignUserRole(parameter) {
  return request({
    url: USER_ROLE,
    method: POST,
    data: parameter
  })
}

export function getUserRoles(parameter) {
  return request({
    url: `${USER}/${parameter}${ROLE}`,
    method: GET
  })
}

export async function getRoutesConfig() {
  return request(ROUTES, METHOD.GET)
}
