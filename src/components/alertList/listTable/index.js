import React, { PropTypes, Component } from 'react'
import { Button, Popover } from 'antd';
import { connect } from 'dva'
import ListTable from './ListTable'
import styles from '../index.less'

// function ListTimeTableWrap({dispatch, alertListTimeTable}){
const  ListTableWrap = ({dispatch, alertListTable}) => {
  const props = {
    ...alertListTable,
    loadMore(){
      dispatch({
        type: 'alertListTable/loadMore'
      })
    },
    setTimeLineWidth(gridWidth, minuteToWidth){
      dispatch({
        type: 'alertListTable/setTimeLineWidth',
        payload: {
          gridWidth,
          minuteToWidth
        }
      })
    },
    checkAlertFunc(e){
      const alertInfo = JSON.parse(e.target.getAttribute('data-all'));

      dispatch({
        type: 'alertListTable/changeCheckAlert',
        payload: alertInfo
      })
    },
    detailClick(e) {
      const alertId = JSON.parse(e.target.getAttribute('data-id'));

      dispatch({
        type: 'alertListTable/clickDetail',
        payload: alertId
      })
    },
    // children展开
    spreadChild(e) {
      const alertId = JSON.parse(e.target.getAttribute('data-id'));

      dispatch({
        type: 'alertListTable/spreadChild',
        payload: alertId
      })
    },
    noSpreadChild(e) {
      const alertId = JSON.parse(e.target.getAttribute('data-id'));

      dispatch({
        type: 'alertListTable/noSpreadChild',
        payload: alertId
      })
    },
    // 分组展开
    spreadGroup(e) {
      const groupClassify = e.target.getAttribute('data-classify')
      
      dispatch({
        type: 'alertListTable/spreadGroup',
        payload: groupClassify
      })
    },
    noSpreadGroup(e) {
      const groupClassify = e.target.getAttribute('data-classify')
      
      dispatch({
        type: 'alertListTable/noSpreadGroup',
        payload: groupClassify
      })
    },
    toggleSelectedAll(e) {
      dispatch({
        type: 'alertListTable/toggleSelectedAll'
      })
    },
    // 解除告警
    relieveClick(e) {
      e.stopPropagation();
      const alertInfo = JSON.parse(e.target.getAttribute('data-all'));
      
      dispatch({
        type: 'alertOperation/openRelieveModalByButton',
        payload: alertInfo
      })
    },
    // 升序
    orderUp(e) {
      const orderKey = e.target.getAttribute('data-key');
      
      dispatch({
        type: 'alertListTable/orderList',
        payload: {
          orderBy: orderKey,
          orderType: 1
        }
      })
    },
    // 降序
    orderDown(e) {
      const orderKey = e.target.getAttribute('data-key');
      
      dispatch({
        type: 'alertListTable/orderList',
        payload: {
          orderBy: orderKey,
          orderType: 0
        }
      })
    },
    orderByTittle(e) {
      const orderKey = e.target.getAttribute('data-key');

      dispatch({
        type: 'alertListTable/orderByTittle',
        payload: orderKey
      })
    }
  }

  return (
    <ListTable {...props} />
  )
}
export default connect(
  (state) => {
    return {
      alertListTable: {
        ...state.alertListTable,
      }
    }
  }
)(ListTableWrap)
