/**
 * ============================================================
 *  Mock 适配器
 *  —— 模拟后端 REST 接口：按「METHOD /path」匹配路由并返回约定响应体
 *  —— 关闭 VITE_USE_MOCK 后本文件不生效，前端自动请求真实后端
 * ============================================================
 */
import * as mock from './data'

/** 路由表：key = "get /api/v1/xxx" */
const routes = {
  // —— 总览 ——
  'get /api/v1/overview/kpi': () => mock.getKpi(),
  'get /api/v1/overview/notices': () => mock.getNotices(),

  // —— 健康指标 ——
  'get /api/v1/health/summary': () => mock.getHealthSummary(),
  'get /api/v1/health/indicator-trend': (p) => mock.getIndicatorTrend(Number(p.days) || 30),
  'get /api/v1/health/age-profile': () => mock.getAgeProfile(),
  'get /api/v1/health/chronic-disease': () => mock.getChronicDisease(),
  'get /api/v1/health/community-compare': () => mock.getCommunityCompare(),
  'get /api/v1/health/risk-score': () => mock.getRiskScore(),
  'get /api/v1/health/abnormal-list': (p) => mock.getAbnormalList(Number(p.size) || 60),

  // —— 服务需求 ——
  'get /api/v1/service/summary': () => mock.getServiceSummary(),
  'get /api/v1/service/demand-trend': (p) => mock.getDemandTrend(Number(p.days) || 30),
  'get /api/v1/service/type-rank': () => mock.getServiceTypeRank(),
  'get /api/v1/service/heatmap': () => mock.getServiceHeatmap(),
  'get /api/v1/service/supply-gap': () => mock.getSupplyGap(),
  'get /api/v1/service/satisfaction': () => mock.getSatisfaction(),
  'get /api/v1/service/order-list': (p) => mock.getOrderList(Number(p.size) || 50),

  // —— 紧急事件 ——
  'get /api/v1/emergency/overview': () => mock.getEmergencySummary(),
  'get /api/v1/emergency/type-dist': (p) => mock.getEmergencyTypeDist(Number(p.months) || 6),
  'get /api/v1/emergency/hour-dist': () => mock.getEmergencyHourDist(),
  'get /api/v1/emergency/handle-funnel': () => mock.getHandleFunnel(),
  'get /api/v1/emergency/response-trend': (p) => mock.getEmergencyResponseTrend(Number(p.days) || 30),
  'get /api/v1/emergency/event-list': (p) => mock.getEmergencyList(Number(p.size) || 40),

  // —— 服务人员 ——
  'get /api/v1/staff/overview': () => mock.getStaffSummary(),
  'get /api/v1/staff/distribution': () => mock.getStaffDistribution(),
  'get /api/v1/staff/response-time': () => mock.getResponseTime(),
  'get /api/v1/staff/load-satisfaction': () => mock.getLoadSatisfaction(),
  'get /api/v1/staff/skill-radar': () => mock.getSkillRadar(),
  'get /api/v1/staff/staff-list': (p) => mock.getStaffList(Number(p.size) || 50),

  // —— 老人档案 ——
  'get /api/v1/elder/list': (p) => mock.getElderList(Number(p.size) || 60)
}

/** 解析 query 参数 */
function parseParams(config) {
  const params = { ...(config.params || {}) }
  if (config.url && config.url.includes('?')) {
    const [path, qs] = config.url.split('?')
    config.url = path
    new URLSearchParams(qs).forEach((v, k) => {
      if (params[k] === undefined) params[k] = v
    })
  }
  return params
}

/**
 * axios 自定义适配器
 * @returns {Promise<{data:any,status:number,statusText:string,headers:object,config:object}>}
 */
export function mockAdapter(config) {
  const method = (config.method || 'get').toLowerCase()
  const params = parseParams(config)

  // axios 传入的是相对路径，baseURL 由适配器自行拼接，这里还原成完整路径再匹配路由
  const base = (config.baseURL || '').replace(/\/+$/, '')
  const url = (config.url || '').replace(/\/+$/, '')
  const fullPath = `${base}${url}`

  const handler = routes[`${method} ${fullPath}`] || routes[`${method} ${url}`]

  return new Promise((resolve, reject) => {
    // 模拟网络延迟 120~360ms
    const latency = 120 + Math.random() * 240
    setTimeout(() => {
      if (!handler) {
        reject(
          Object.assign(new Error(`Mock 未实现的接口: ${method} ${fullPath}`), {
            config,
            response: {
              status: 404,
              data: { code: 404, message: `Mock 未实现的接口: ${method} ${fullPath}`, data: null }
            }
          })
        )
        return
      }
      try {
        const data = handler(params)
        resolve({
          data: { code: 0, message: 'ok', data },
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
          config
        })
      } catch (e) {
        reject(e)
      }
    }, latency)
  })
}
