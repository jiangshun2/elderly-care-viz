import request from '../request'

/**
 * 健康指标
 */
export const getHealthSummary = () => request.get('/health/summary')

export const getIndicatorTrend = (params = {}) => request.get('/health/indicator-trend', { params })

export const getAgeProfile = () => request.get('/health/age-profile')

export const getChronicDisease = () => request.get('/health/chronic-disease')

export const getCommunityCompare = () => request.get('/health/community-compare')

export const getRiskScore = () => request.get('/health/risk-score')

export const getAbnormalList = (params = {}) => request.get('/health/abnormal-list', { params })
