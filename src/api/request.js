/**
 * ============================================================
 *  axios 实例封装
 *  后端接口基地址通过 .env 中的 VITE_API_BASE_URL 配置；
 *  当前阶段默认开启 Mock（VITE_USE_MOCK=true），切换到真实后端只需改环境变量。
 * ============================================================
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { mockAdapter } from './mock'

export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'true') === 'true'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 15000),
  headers: { 'Content-Type': 'application/json' }
})

// 开启 Mock：用本地适配器拦截请求，不发起真实网络请求
if (USE_MOCK) {
  request.defaults.adapter = mockAdapter
}

// —— 请求拦截：注入 token / 租户等公共头 ——
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ACCESS_TOKEN')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // 预留：多租户 / 机构标识
    const orgId = localStorage.getItem('ORG_ID')
    if (orgId) {
      config.headers['X-Org-Id'] = orgId
    }
    return config
  },
  (error) => Promise.reject(error)
)

// —— 响应拦截：统一解包与错误提示 ——
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 约定后端返回 { code, data, message }；兼容直接返回裸数据
    if (res && typeof res === 'object' && 'code' in res) {
      if (res.code === 0 || res.code === 200) {
        return res.data
      }
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  (error) => {
    const msg = error?.response?.data?.message || error.message || '网络异常'
    ElMessage.error(`接口请求失败：${msg}`)
    return Promise.reject(error)
  }
)

export default request
