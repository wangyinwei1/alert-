import React, { PropTypes, Component } from 'react'
import { connect } from 'dva'
import LeftMenu from '../components/layout/leftMenu/leftWrap'
import styles from '../components/layout/main.less'
import Bread from '../components/layout/bread/index'
import NotificationApi from '../components/common/webNotification/index.js'
import { classnames } from '../utils'
import '../components/layout/common.less'

const claarLocalStorage = () => {
  // 清除一些localstorge存储的用户操作
  localStorage.removeItem('UYUN_Alert_USERINFO')
  localStorage.removeItem('UYUN_Alert_MANAGEFILTER')
  console.log(localStorage)
}

class App extends Component {

  constructor(props) {
    super(props)
    this.claarLocalStorage = claarLocalStorage.bind(this)
  }


  componentDidMount() {
    this.context.router.setRouteLeaveHook(this.props.route, () => {
      console.log('Leave')
      this.claarLocalStorage();
    })
    NotificationApi.config({
      placement: 'toopRight',
      threshold: 10
    })
    window.addEventListener('beforeunload', (e) => {
      console.log('beforeunload unmount')
      var confirmationMessage = "\o/";
      // -------- operation ---------------
      this.claarLocalStorage();
      e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.app.notifies !== this.props.app.notifies) {
      NotificationApi.update(nextProps.app.notifies)
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.app.notifies !== this.props.app.notifies) {
      return false
    }
    return true
  }

  componentWillUnmount() {
    console.log('app unmount')
    NotificationApi.destroy();
    this.claarLocalStorage();
  }

  render() {
    const { children, location, dispatch, app, isNeedContent, temp } = this.props;
    const { isShowMask, isFold } = app
    // params.isNeedContent确定需不需要content这个容器
    const { params } = children && children.props || {};

    const LeftMenuProps = {
      isFold,
      location,
      handleFoldMenu() {
        dispatch({
          type: 'app/handleFoldMenu'
        })
        // 告警列表柱状图
        dispatch({
          type: 'alertList/updateResize',
          payload: !isFold
        })
        // 告警列表table
        dispatch({
          type: 'alertListTable/updateResize',
          payload: !isFold
        })
        if (location.pathname === '/alertManage' || location.pathname === '/') {
          dispatch({
            type: 'alertManage/queryAlertDashbord',
            payload: {
              isNeedRepaint: true
            }
          })
        }

      }
    }
    return (
      <div>
        {isShowMask && <div className={styles.layer}></div>}
        <div className={classnames(styles.layout, !isFold ? '' : styles.fold)}>
          <LeftMenu {...LeftMenuProps} />
          <div id="topMain" className={styles.main}>
            <Bread location={location} />
            <div className={styles.container}>
              <div className={params && params.isNeedContent === false ? styles.no_content : styles.content} id="content">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

App.contextTypes = {
  router: React.PropTypes.object
}
App.propTypes = {
  children: PropTypes.element.isRequired,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  isFold: PropTypes.bool
}


export default connect(({ app }) => ({ app }))(App)
