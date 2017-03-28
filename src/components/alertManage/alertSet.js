import React, { PropTypes, Component } from 'react'
import styles from './index.less'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl';

const formatMessages = defineMessages({
    noData:{
      id: 'alertManage_noData',
      defaultMessage: '告警看板暂无数据，请先设置关注数据',
    }
})

class AlertSet extends Component{

  render(){
    const {onOk, hideAlertSetTip} = this.props
    return (
      <div className={styles.alertSet}>
        <div className={styles.alertSetInfo}><FormattedMessage {...formatMessages['noData']} /></div>
        {!hideAlertSetTip && <div className={styles.alertSetTip} onClick={onOk}></div>}
      </div>
    )
  }
}
// function AlertSet({alertSetProps}){
//
//
// }
export default AlertSet
