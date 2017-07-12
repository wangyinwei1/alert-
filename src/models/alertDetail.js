import { parse } from 'qs'
import { queryDetail } from '../services/alertDetail'
import { queryCloumns } from '../services/alertQuery'
import { getFormOptions, dispatchForm, close, resolve, merge, relieve, suppress, getChatOpsOptions, shareRoom, changeTicket, viewTicket, notifyOperate, takeOverService, reassignAlert } from '../services/alertOperation'
import { getUsers } from '../services/app.js';
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp';
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl';

const initalState = {
  id: undefined, // 告警编号
  isShowDetail: false, // 是否显示detail
  isLoading: false, // 是否处于加载中状态

  users: [], //获取的可转派用户

  isShowFormModal: false, // 派发工单modal
  isShowChatOpsModal: false,
  isShowTicketModal: false, // 是否显示通知modal
  formOptions: [],
  chatOpsRooms: [], // 群组
  isShowCloseModal: false,
  isShowResolveModal: false,
  isShowTimeSliderModal: false, // suppress
  isShowRemindModal: false, // 提醒框
  isShowNotifyModal: false, // 手工通知
  notifyIncident: {}, // 通知告警
  notifyUsers: [], // 告警通知用户
  disableChatOps: false, // 是否可以私发chatops

  dispatchDisabled: false,
  closeDisabled: false,
  resolveDisabled: false,
  notifyDisabled: false,
  shareDisabled: false,

  ticketUrl: '', //工单链接
  ciUrl: '', //ci信息的链接

  currentAlertDetail: {},

  operateForm: undefined, // 操作工单（当前）
  isShowOperateForm: false, // 是否显示操作工单文本

  operateRemark: undefined, // 备注信息
  isShowRemark: false, // 是否显示备注框
}

export default {
  namespace: 'alertDetail',

  state: initalState,

  subscriptions: {
    alertExportViewDetail({dispatch, history}) {
      history.listen((location) => {
        if (pathToRegexp('/export/viewDetail/:id').test(location.pathname)) {
          const match = pathToRegexp('/export/viewDetail/:id').exec(location.pathname);
          const incidentId = match[1];
          dispatch({
            type: 'openDetailModal',
            payload: {
              alertId: incidentId
            }
          })
        }
      })
    },
  },

  effects: {
    // 打开抑制告警Modal
    *openSuppressTimeSlider({ payload }, { select, put, call }) {
      yield put({
        type: 'toggleSuppressTimeSliderModal',
        payload: true
      })
    },
    // 抑制告警
    *suppressIncidents({ payload: { time, resolve } }, { select, put, call }) {
      const successRemind = yield localStorage.getItem('__alert_suppress_remind')
      const viewDetailAlertId = yield select(state => state.alertDetail.id)

      if (viewDetailAlertId && time !== undefined) {
        let stringId = '' + viewDetailAlertId;
        const suppressData = yield suppress({
          incidentIds: [stringId],
          time: Number(time)
        })
        if (suppressData.result) {
          if (successRemind === null || JSON.parse(successRemind)) {
            yield put({
              type: 'toggleRemindModal',
              payload: true
            })
          } else {
            yield message.success(window.__alert_appLocaleData.messages['constants.success'], 3);
          }
        } else {
          yield message.error(suppressData.message, 3);
        }
        resolve && resolve(suppressData)
      } else {
        resolve && resolve(false)
        console.error('select incident/incident type error');
      }
    },
    // 手工通知
    *openNotify({ payload }, { select, put, call }) {
      const options = yield getChatOpsOptions();
      const { currentAlertDetail } = yield select(state => {
        return {
          'currentAlertDetail': state.alertDetail.currentAlertDetail
        }
      })
      const result = yield call(getUsers);
      if (result.result) {
        yield put({
          type: 'initManualNotifyModal',
          payload: {
            notifyIncident: currentAlertDetail,
            isShowNotifyModal: true,
            notifyUsers: result.data,
            disableChatOps: options.result ? false : true
          }
        })
      } else {
        yield message.error(result.message, 3);
      }
    },
    *notyfiyIncident({ payload }, { select, put, call }) {
      const viewDetailAlertId = yield select(state => state.alertDetail.id)
      if (viewDetailAlertId) {
        let stringId = '' + viewDetailAlertId;
        const notify = yield call(notifyOperate, {
          incidentId: stringId,
          ...(payload.data)
        })
        if (notify.result) {
          // yield put({ type: 'alertQuery/changeCloseState', payload: { arrList: [stringId], status: 150 } })
          // yield put({ type: 'alertQuery/queryAlertList' })
          yield put({ type: 'openDetailModal' })

          yield message.success(window.__alert_appLocaleData.messages['constants.success'], 3);
        } else {
          yield message.error(notify.message, 3);
        }
        payload.resolve && payload.resolve(notify.result)
      } else {
        payload.resolve && payload.resolve(false)
        console.error('please select incidet/incident is error');
      }
      yield put({
        type: 'initManualNotifyModal',
        payload: {
          isShowNotifyModal: false
        }
      })
    },
    // 打开派发工单做的相应处理
    *openFormModal({ payload }, { select, put, call }) {
      const options = yield getFormOptions();
      if (options.result) {
        yield put({
          type: 'setFormOptions',
          payload: options.data || []
        })
      } else {
        yield message.error(`${options.message}`, 3)
      }
      yield put({
        type: 'toggleDispatchModal',
        payload: true
      })
    },
    // 确定派发工单
    *dispatchForm({ payload }, { select, put, call }) {

      const viewDetailAlertId = yield select(state => state.alertDetail.id)

      if (viewDetailAlertId) {
        let stringId = '' + viewDetailAlertId;
        const data = yield call(dispatchForm, {
          id: stringId,
          code: payload.id,
          name: payload.name
        })
        if (data.result) {
          //window.open(data.data.url)
          yield put({
            type: 'toggleTicketModal',
            payload: {
              isShowTicketModal: true,
              ticketUrl: data.data.url
            }
          })
        } else {
          yield message.error(data.message, 3);
        }

        payload && payload.resolve && payload.resolve(data);
      } else {
        payload && payload.resolve && payload.resolve(false);
        console.error('selectedAlertIds error');
      }
      yield put({
        type: 'toggleDispatchModal',
        payload: false
      })
    },
    // 派发工单成功后的操作
    *afterDispatch({ payload }, { select, put, call }) {
      const viewDetailAlertId = yield select(state => state.alertDetail.id)
      // yield put({ type: 'alertQuery/changeCloseState', payload: { arrList: ['' + viewDetailAlertId], status: 150 } })
      // yield put({ type: 'alertQuery/queryAlertList' })
      yield put({ type: 'openDetailModal' })
      yield put({ type: 'closeTicketModal' })
    },
    // 打开关闭工单
    *openCloseModal({ payload }, { select, put, call }) {
      yield put({ type: 'toggleCloseModal', payload: true })
    },
    // 点击展开detail时的操作
    *openDetailModal({ payload={} }, { select, put, call }) {
      let viewDetailAlertId = payload.alertId;
      if(!viewDetailAlertId) {
        viewDetailAlertId = yield select(state => state.alertDetail.id);
      }

      // 去除上一次的orderFlowNum和ciUrl地址，并且设置加载中的状态
      yield put({
        type: 'beforeOpenDetail',
        payload: {
          id: viewDetailAlertId
        }
      })
      // 点击后马上显示，减少卡顿感
      yield put({
        type: 'toggleDetailModal',
        payload: true
      })
      if (viewDetailAlertId) {
        const detailResult = yield queryDetail(viewDetailAlertId);
        if (detailResult.result) {
          yield put({
            type: 'setDetail',
            payload: detailResult.data || {}
          })
          yield put({
            type: 'setDetailBtnDisable',
            payload: detailResult.data
          })
          if (detailResult.data && detailResult.data.orderFlowNum) {
            yield put({
              type: 'setFormData',
              payload: detailResult.data.orderFlowNum
            })
          }
          if (detailResult.data && detailResult.data.ciUrl !== undefined && detailResult.data.ciUrl != '') {
            yield put({
              type: 'setCiUrl',
              payload: detailResult.data.ciUrl
            })
          }
        } else {
          yield message.error(detailResult.message, 3);
        }
      } else {
        console.error('viewDetailAlertId type error')
      }

      // 内容获取后取消加载状态
      yield put({
        type: 'toggleLoading',
        payload: false
      });
    },
    // 编辑工单流水号
    *changeTicketFlow({ payload }, { select, put, call }) {
      const { currentAlertDetail } = yield select(state => {
        return {
          'currentAlertDetail': state.alertDetail.currentAlertDetail
        }
      })
      if (payload !== undefined) {
        const changeResult = yield call(changeTicket, {
          id: currentAlertDetail.id,
          orderFlowNum: payload
        })
        if (changeResult.result) {
          yield message.success(window.__alert_appLocaleData.messages['constants.success'], 3);
          yield put({
            type: 'setFormData',
            payload: payload
          })
        } else {
          yield message.error(changeResult.message, 3);
        }
      } else {
        console.error('ticket flow is null')
      }
    },
    // 工单详情
    *viewTicketDetail({ payload }, { select, put, call }) {
      const { currentAlertDetail } = yield select(state => {
        return {
          'currentAlertDetail': state.alertDetail.currentAlertDetail
        }
      })
      if (currentAlertDetail.itsmDetailUrl) {
        yield window.open(currentAlertDetail.itsmDetailUrl)

        return;
      }
      if (payload !== undefined) {
        const viewResult = yield call(viewTicket, payload)
        if (viewResult.result) {
          if (viewResult.data !== undefined && viewResult.data.url !== '') {
            window.open(viewResult.data.url)
          }
        } else {
          yield message.error(viewResult.message, 3);
        }
      } else {
        console.error('Ticket Flow is null')
      }
    },
    // 关闭时
    *closeDetailModal({ payload }, { select, put, call }) {
      yield put({
        type: 'toggleDetailModal',
        payload: false
      })
    },
    // 关闭告警
    *closeAlert({ payload }, { select, put, call }) {
      const viewDetailAlertId = yield select(state => state.alertDetail.id);

      if (viewDetailAlertId) {
        let stringId = '' + viewDetailAlertId;
        const resultData = yield close({
          incidentIds: [stringId],
          closeMessage: payload.closeMessage
        })
        if (resultData.result) {
          if (resultData.data.result) {
            // yield put({ type: 'alertDetail/changeCloseState', payload: { arrList: [stringId], status: 255 } })
            // yield put({ type: 'alertQuery/queryAlertList' })
            yield put({ type: 'openDetailModal' })
            yield message.success(window.__alert_appLocaleData.messages['constants.success'], 3);
          } else {
            yield message.error(`${resultData.data.failures}`, 3);
          }
        } else {
          yield message.error(resultData.message, 3);
        }

        payload && payload.resolve && payload.resolve(resultData);
      } else {
        payload && payload.resolve && payload.resolve(false);
        console.error('select incident/incident type error');
      }
      yield put({
        type: 'toggleCloseModal',
        payload: false
      })
    },
    // 解决告警
    *resolveAlert({ payload }, { select, put, call }) {
      const viewDetailAlertId = yield select(state => state.alertDetail.id);

      if (viewDetailAlertId) {
        let stringId = '' + viewDetailAlertId;
        const resultData = yield resolve({
          incidentIds: [stringId],
          resolveMessage: payload.resolveMessage
        })
        if (resultData.result) {
          if (resultData.data.result) {
            // yield put({ type: 'alertQuery/changeCloseState', payload: { arrList: [stringId], status: 190 } })
            // yield put({ type: 'alertQuery/queryAlertList' })
            yield put({ type: 'openDetailModal' })
            yield message.success(window.__alert_appLocaleData.messages['constants.success'], 3);
          } else {
            yield message.error(`${resultData.data.failures}`, 3);
          }
        } else {
          yield message.error(resultData.message, 3);
        }
        payload && payload.resolve && payload.resolve(resultData);
      } else {
        payload && payload.resolve && payload.resolve(false);
        console.error('select incident/incident type error');
      }
      yield put({
        type: 'toggleResolveModal',
        payload: false
      })
    },
    // 打开分享到ChatOps的modal
    *openChatOps({ payload }, { select, put, call }) {
      const options = yield getChatOpsOptions();
      if (options.result) {
        yield put({
          type: 'setChatOpsRoom',
          payload: options.data || [],
        })
      }
      yield put({
        type: 'toggleChatOpsModal',
        payload: true
      })
    },
    *shareChatOps({ payload }, { select, put, call }) {
      const { currentAlertDetail } = yield select(state => {
        return {
          'currentAlertDetail': state.alertDetail.currentAlertDetail
        }
      })
      if (currentAlertDetail !== undefined && Object.keys(currentAlertDetail).length !== 0) {
        let roomId = payload.id;
        let incidentId = currentAlertDetail.id;
        let roomName = payload.roomName
        const shareResult = yield shareRoom(roomId, incidentId, roomName, {
          body: {
            type: 'alert',
            data: {
              ...currentAlertDetail,
              severityDesc: window['_severity'][currentAlertDetail['severity']],
              status: window['_status'][currentAlertDetail['status']],
            }
          }
        });
        if (shareResult.result) {
          yield message.success(window.__alert_appLocaleData.messages['constants.success'], 2)
        } else {
          yield message.error(`${shareResult.message}`, 2)
        }
      }
      yield put({
        type: 'toggleChatOpsModal',
        payload: false
      })
    },
    //接手告警
    *takeOver({ payload }, { select, put, call }) {
      const viewDetailAlertId = yield select(state => state.alertDetail.id)
      if (viewDetailAlertId) {
        let response = yield call(takeOverService, { alertIds: [viewDetailAlertId] });
        if (response.result) {
          const { success, failed, lang } = response.data;
          if (Array.isArray(success) && success.length > 0) {
            // yield put({ type: 'alertQuery/queryAlertList' })
            const successMsg = success.map(item => `${item.name}: ${item['msg_' + lang]}`).join('\n');
            message.success(successMsg, 3);
            yield put({ type: 'openDetailModal' })
          } else if (Array.isArray(failed) && failed.length > 0) {
            const failedMsg = failed.map(item => `${item.name}: ${item['msg_' + lang]}`).join('\n');
            message.error(failedMsg, 3);
            response.result = false;
          }
        } else {
          message.error(`${response.message}`, 2)
        }

        payload && payload.resolve && payload.resolve(response);
      }

    },

    //打开转派告警Model
    *openReassign({ payload: position }, { select, put, call }) {
      const users = yield select(state => state.alertDetail.users);
      if (users.length === 0) {
        const response = yield call(getUsers);
        if (response.result) {
          yield put({
            type: 'receiveAllUsers',
            payload: response.data
          });
        } else {
          message.error(response.message, 2);
        }
      }
      yield put({
        type: 'toggleReassignModal',
        payload: true
      });
    },
    //转派
    *submitReassign({ payload: { toWho } }, { select, put, call }) {
      const viewDetailAlertId = yield select(state => state.alertDetail.id);
      let response = yield call(reassignAlert, {
        toWho,
        incidentIds: [viewDetailAlertId]
      });
      if (response.result) {
        const { success, failed, lang } = response.data;
        if (Array.isArray(success) && success.length > 0) {
          // yield put({ type: 'alertQuery/queryAlertList' })
          const successMsg = success.map(item => `${item.name}: ${item['msg_' + lang]}`).join('\n');
          message.success(successMsg, 3);
          yield put({
            type: 'toggleReassignModal',
            payload: false
          });
          yield put({ type: 'toggleDetailModal', payload: false });
        } else if (Array.isArray(failed) && failed.length > 0) {
          const failedMsg = failed.map(item => `${item.name}: ${item['msg_' + lang]}`).join('\n');
          message.error(failedMsg, 3);
          response.result = false;
        }
      } else {
        message.error(response.message, 2);
      }

      payload && payload.resolve && payload.resolve(response);
    },

  },

  reducers: {
    // beforeOpenDetail
    beforeOpenDetail(state, { payload }) {
      console.log(payload, "beforeOpenDetail")
      return { ...state, operateForm: initalState.operateForm, ciUrl: initalState.ciUrl, isShowDetail: true, isLoading: true, id: payload.id }
    },
    // 显示modal后取消加载中状态
    toggleLoading(state, { payload: isLoading }) {
      return { ...state, isLoading }
    },
    // 设置分组显示的类型
    setGroupType(state, { payload: selectGroup }) {
      return { ...state, selectGroup }
    },
    // 移除分组显示的类型
    removeGroupType(state) {
      return { ...state, selectGroup: initalState.selectGroup }
    },
    // -----------------------------------------------
    // 初始化operateForm
    initalFormData(state) {
      return { ...state, operateRemark: state.currentAlertDetail.form }
    },
    // 储存detail信息
    setDetail(state, { payload: currentAlertDetail }) {
      return { ...state, currentAlertDetail, isShowOperateForm: false }
    },
    // 设置chatOps群组
    setChatOpsRoom(state, { payload }) {
      return { ...state, chatOpsRooms: payload }
    },
    // 转换modal状态
    toggleChatOpsModal(state, { payload: isShowChatOpsModal }) {
      return { ...state, isShowChatOpsModal }
    },
    // 切换侧滑框的状态
    toggleDetailModal(state, { payload: isShowDetail }) {
      return { ...state, isShowDetail, id: isShowDetail?state.id:undefined }
    },
    // 设置工单类型
    setFormOptions(state, { payload }) {
      return { ...state, formOptions: payload }
    },
    // 切换派发工单modal的状态
    toggleDispatchModal(state, { payload: isShowFormModal }) {
      return { ...state, isShowFormModal }
    },
    toggleCloseModal(state, { payload: isShowCloseModal }) {
      return { ...state, isShowCloseModal }
    },
    toggleResolveModal(state, { payload: isShowResolveModal }) {
      return { ...state, isShowResolveModal }
    },
    // 切换工单的状态
    toggleFormModal(state, { payload: isShowOperateForm }) {
      return { ...state, isShowOperateForm }
    },
    // 切换备注的状态
    toggleRemarkModal(state, { payload: isShowRemark }) {
      return { ...state, isShowRemark }
    },
    toggleSuppressTimeSliderModal(state, { payload: isShowTimeSliderModal }) {
      return { ...state, isShowTimeSliderModal }
    },
    toggleRemindModal(state, { payload: isShowRemindModal }) {
      return { ...state, isShowRemindModal }
    },
    toggleReassignModal(state, { payload: isShowReassingModal }) {
      return {
        ...state,
        isShowReassingModal
      }
    },
    initManualNotifyModal(state, { payload: { isShowNotifyModal = false, notifyIncident = {}, notifyUsers = [], disableChatOps = false } }) {
      return { ...state, isShowNotifyModal, notifyIncident, notifyUsers, disableChatOps }
    },
    // 存储工单信息
    setFormData(state, { payload: operateForm }) {
      return { ...state, operateForm }
    },
    // 存储备注信息
    setRemarkData(state, { payload: operateRemark }) {
      return { ...state, operateRemark }
    },
    // 派发工单框
    toggleTicketModal(state, { payload: payload }) {
      return { ...state, ...payload }
    },
    // ci链接
    setCiUrl(state, { payload: ciUrl }) {
      return { ...state, ciUrl: ciUrl }
    },
    // 关闭工单
    closeTicketModal(state) {
      return {
        ...state,
        isShowTicketModal: false,
        ticketUrl: '',
      }
    },
    //设置detail页面各个button的disable状态
    setDetailBtnDisable(state, { payload: currentAlertDetail }) {
      const { parentId, status } = currentAlertDetail;
      // 子告警不能派发、已关闭的不能派发、未接手的不能派发
      const dispatchDisabled = parentId || status === 255 || status === 0
      // 子告警不能关闭、处理中和已关闭的不能关闭
      const closeDisabled = parentId || status === 255 || status === 40 || status === 0
      // 子告警不能解决、已解决和已关闭的不能解决
      const resolveDisabled = parentId || status === 255 || status === 190 || status === 0
      // 子告警不能通知、只有未接手和处理中的告警能通知
      const notifyDisabled = parentId || !(status === 0 || status == 150)
      // 子告警不能分享
      const shareDisabled = parentId;
      return {
        ...state,
        dispatchDisabled,
        closeDisabled,
        resolveDisabled,
        notifyDisabled,
        shareDisabled
      }
    },

    // 设置所有可分配的用户列表
    receiveAllUsers(state, { payload: users }) {
      return {
        ...state,
        users
      }
    }
  },

}
