/**
 * ============================================================
 *  接口文档（后端待实现 / 联调对照表）
 *
 *  约定：
 *    GET  /api/v1/{模块}/{资源}?query
 *    统一响应体 { code: 0, data: {...}, message: 'ok' }
 *
 *  本文件仅声明"前端将要调用的真实端点"，
 *  Mock 层按同样的路径返回数据，切换真实后端时前端零改动。
 * ============================================================
 */
export const API = {
  overview: {
    kpi:             'GET /api/v1/overview/kpi',
    healthBoard:     'GET /api/v1/overview/health-board',
    serviceBoard:    'GET /api/v1/overview/service-board',
    emergencyBoard:  'GET /api/v1/overview/emergency-board',
    staffBoard:      'GET /api/v1/overview/staff-board',
    notices:         'GET /api/v1/overview/notices'
  },
  health: {
    summary:         'GET /api/v1/health/summary',
    indicatorTrend:  'GET /api/v1/health/indicator-trend',
    ageProfile:      'GET /api/v1/health/age-profile',
    chronic:         'GET /api/v1/health/chronic-disease',
    communityCompare:'GET /api/v1/health/community-compare',
    riskScore:       'GET /api/v1/health/risk-score',
    abnormalList:    'GET /api/v1/health/abnormal-list'
  },
  service: {
    demandTrend:     'GET /api/v1/service/demand-trend',
    typeRank:        'GET /api/v1/service/type-rank',
    heatmap:         'GET /api/v1/service/heatmap',
    supplyGap:       'GET /api/v1/service/supply-gap',
    satisfaction:    'GET /api/v1/service/satisfaction',
    orderList:       'GET /api/v1/service/order-list'
  },
  emergency: {
    overview:        'GET /api/v1/emergency/overview',
    typeDist:        'GET /api/v1/emergency/type-dist',
    hourDist:        'GET /api/v1/emergency/hour-dist',
    funnel:          'GET /api/v1/emergency/handle-funnel',
    responseTrend:   'GET /api/v1/emergency/response-trend',
    eventList:       'GET /api/v1/emergency/event-list'
  },
  staff: {
    overview:        'GET /api/v1/staff/overview',
    distribution:    'GET /api/v1/staff/distribution',
    responseTime:    'GET /api/v1/staff/response-time',
    loadSatisfaction:'GET /api/v1/staff/load-satisfaction',
    skillRadar:      'GET /api/v1/staff/skill-radar',
    staffList:       'GET /api/v1/staff/staff-list'
  },
  elder: {
    list:            'GET /api/v1/elder/list',
    detail:          'GET /api/v1/elder/detail/:id'
  }
}
