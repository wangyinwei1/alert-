import { request } from '../utils'
import querystring from 'querystring';

export async function queryAlertDashbord () {
  return request('/mock/app.json', {
    method: 'get'
  })
}

export async function getUserInformation() {
  return request(`/dataService/getUserInfo`, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      }
  })
}

// 获取所有用户信息
export async function getUsers() {
  return request(`/common/getUsers`, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      }
  })
}

// web notification
export async function getWebNotification() {
  return request(`/common/getWebNotification`, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      }
  })
}