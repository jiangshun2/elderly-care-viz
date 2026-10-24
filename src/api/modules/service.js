import request from '../request'

/**
 * 服务需求
 */
export const getServiceSummary = () => request.get('/service/summary')

export const getDemandTrend = (params = {}) => request.get('/service/demand-trend', { params })

export const getTypeRank = () => request.get('/service/type-rank')

export const getHeatmap = () => request.get('/service/heatmap')

export const getSupplyGap = () => request.get('/service/supply-gap')

export const getSatisfaction = () => request.get('/service/satisfaction')

export const getOrderList = (params = {}) => request.get('/service/order-list', { params })
