import { request, packURL } from '../utils'
import {stringify} from 'qs'

export async function queryAlertListTime(data) {
  const options = {
    body: JSON.stringify(data),
    method: 'post'
  }
  return request('/api/v2/incident/queryLastTimeline', options)
}
// 查询告警柱状图
export async function queryAlertBar(data) {
  
  const options = {
    body: JSON.stringify(data),
    headers: {
        'Content-Type': 'application/json',
    },
    method: 'post'
  }

  return request('/api/v2/incident/buckets', options)
}

// 查询告警列表(未分组)
export async function queryAlertList(data) {
  const options = {
    body: JSON.stringify(data),
    headers: {
        'Content-Type': 'application/json',
    },
    method: 'post'
  }

  return request('/api/v2/incident/queryLastTimeline', options)
}

export async function queryChild(param) {
  const options = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    }
  }

  return request(`/api/v2/incident/query/childs?${stringify(param)}`, options)
}
