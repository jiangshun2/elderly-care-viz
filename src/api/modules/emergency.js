import request from '../request'

/**
 * 紧急事件
 */
export const getEmergencyOverview = () => request.get('/emergency/overview')

export const getTypeDist = (params = {}) => request.get('/emergency/type-dist', { params })

export const getHourDist = () => request.get('/emergency/hour-dist')

export const getHandleFunnel = () => request.get('/emergency/handle-funnel')

export const getResponseTrend = (params = {}) => request.get('/emergency/response-trend', { params })

export const getEventList = (params = {}) => request.get('/emergency/event-list', { params })
