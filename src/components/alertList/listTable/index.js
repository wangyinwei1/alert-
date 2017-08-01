import React, { PropTypes, Component } from 'react'
import { Button, Popover } from 'antd';
import { connect } from 'dva'
import ListTable from '../../common/listTable'

// function ListTimeTableWrap({dispatch, alertListTimeTable}){
const ListTableWrap = ({ dispatch, userInfo, isNeedCheckOwner, alertListTable, topHeight, topFixArea }) => {
  const props = {
    ...alertListTable,
    topHeight,
    extraArea: topFixArea,
    isNeedCheckOwner,
    userInfo,

    loadMore() {
      dispatch({
        type: 'alertListTable/loadMore'
      })
    },
    setTimeLineWidth(gridWidth, minuteToWidth) {
      dispatch({
        type: 'alertListTable/setTimeLineWidth',
        payload: {
          gridWidth,
          minuteToWidth
        }
      })
    },
    checkAlertFunc(e) {
      const alertId = e.target.getAttribute('data-id');
      dispatch({
        type: 'alertListTable/handleCheckboxClick',
        payload: {
          alertId
        }
      })
    },
    detailClick(e) {
      const alertId = e.target.getAttribute('data-id');

      dispatch({
        type: 'alertDetail/openDetailModal',
        payload: {
          alertId
        }
      })
    },
    // children展开
    spreadChild(e) {
      const alertId = e.target.getAttribute('data-id');

      dispatch({
        type: 'alertListTable/spreadChild',
        payload: alertId
      })
    },
    noSpreadChild(e) {
      const alertId = e.target.getAttribute('data-id');

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
    handleSelectAll(e) {
      const checked = e.target.checked;
      dispatch({
        type: 'alertListTable/handleSelectAll',
        payload: { checked, isNeedCheckOwner }
      });
    },
    // 解除告警
    relieveClick(e) {
      e.stopPropagation();
      const obj = JSON.parse(e.target.getAttribute('data-id'));
      let relieve = null
      if (alertListTable.isGroup) {
        alertListTable.data.forEach( (group) => {
          if (group.classify == obj.classify) {
            group.children.forEach(item => {
              if (item.id == obj.id) {
                relieve = {
                  ...item
                }
              }
            })
          }
        })
      } else {
          alertListTable.data.forEach(item => {
            if (item.id == obj.id) {
              relieve = {
                ...item
              }
            }
          })
      }
      dispatch({
        type: 'alertOperation/openRelieveModalByButton',
        payload: relieve
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
    },
    orderFlowNumClick(e) {
      const orderFlowNum = e.target.getAttribute('data-flow-num');
      const id = e.target.getAttribute('data-id');
      dispatch({
        type: 'alertListTable/orderFlowNumClick',
        payload: { orderFlowNum, id }
      })
    },
    showAlertOrigin(e) {
      const alertId = e.target.getAttribute('data-id');
      const alertName = e.target.getAttribute('data-name');
      dispatch({
        type: 'alertOrigin/toggleVisible',
        payload: {
          visible: true,
          alertName
        }
      })

      dispatch({
        type: 'alertOrigin/initPage'
      })

      dispatch({
        type: 'alertOrigin/queryAlertOrigin',
        payload: {
          alertId,
          alertName
        }
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
      alertListTable: state.alertListTable,
      userInfo: state.app && state.app.userInfo
    }
  }
)(ListTableWrap)
