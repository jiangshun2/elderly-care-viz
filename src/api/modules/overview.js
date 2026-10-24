import request from '../request'

/**
 * 总览驾驶舱
 * 后端对应接口见 src/api/endpoints.js
 */
export const getKpi = () => request.get('/overview/kpi')

export const getNotices = () => request.get('/overview/notices')
