import notification from 'ant-design-vue/es/notification'
import message from 'ant-design-vue/es/message'
import axios from 'axios'
import storage from 'store'
import { LOGOUT } from '@/services/api'

// 跨域认证信息 header 名
const ACCESS_TOKEN = 'Authorization'

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 6000 // 请求超时时间
})

// 设置cross跨域 并设置访问权限 允许跨域携带cookie信息,使用JWT可关闭
request.defaults.withCredentials = true

// http method
const METHOD = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  PATCH: 'patch',
  DELETE: 'delete'
}

const SYSTEM_ERROR = '系统错误'

// 异常拦截处理器
const errorHandler = (error) => {
  if (error.response) {
    const data = error.response.data
    // 从 localstorage 获取 token
    const token = storage.get(ACCESS_TOKEN)
    const status = error.response.status
    if (status === 403) {
      notification.error({
        message: 'Forbidden',
        description: data.msg
      })
    } else if (status === 401 && data.code !== '20002') {
      console.log(data.msg)
      notification.error({
        message: 'Unauthorized',
        description: data.msg || 'Authorization verification failed'
      })
      if (token) {
        request({
          url: LOGOUT,
          method: METHOD.POST
        }).then(() => {
          storage.remove(ACCESS_TOKEN)
          storage.remove(process.env.VUE_APP_ROUTES_KEY)
          storage.remove(process.env.VUE_APP_PERMISSIONS_KEY)
          storage.remove(process.env.VUE_APP_ROLES_KEY)
        }).then(() => {
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        })
      }
    } else {
      message.error(data.msg || SYSTEM_ERROR)
    }
  } else {
    message.error(SYSTEM_ERROR)
  }
  return Promise.reject(error)
}

// request interceptor
request.interceptors.request.use(config => {
  const token = storage.get(ACCESS_TOKEN)
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  if (token) {
    config.headers[ACCESS_TOKEN] = token
  }
  return config
}, errorHandler)

// response interceptor
request.interceptors.response.use((response) => {
  return response.data
}, errorHandler)

export {
  METHOD,
  ACCESS_TOKEN,
  request
}
