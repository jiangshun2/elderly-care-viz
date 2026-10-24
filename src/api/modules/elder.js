import request from '../request'

/**
 * 老人档案
 */
export const getElderList = (params = {}) => request.get('/elder/list', { params })

export const getElderDetail = (id) => request.get(`/elder/detail/${id}`)
