import request from '../request'

/**
 * 服务人员与响应时间
 */
export const getStaffOverview = () => request.get('/staff/overview')

export const getDistribution = () => request.get('/staff/distribution')

export const getResponseTime = () => request.get('/staff/response-time')

export const getLoadSatisfaction = () => request.get('/staff/load-satisfaction')

export const getSkillRadar = () => request.get('/staff/skill-radar')

export const getStaffList = (params = {}) => request.get('/staff/staff-list', { params })
