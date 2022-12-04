import { request, METHOD } from '@/utils/request'
import { LOGS } from './api'

const { GET } = METHOD

export function getPageLogList(parameter) {
  return request({
    url: LOGS,
    method: GET,
    params: parameter
  })
}
