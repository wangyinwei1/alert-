import React, { PropTypes, Component } from 'react'
import { Select, Popover, Checkbox, Dropdown, Menu, Button } from 'antd';
import { connect } from 'dva'
import styles from './index.less'
import { classnames } from '../../../utils'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl';

const Option = Select.Option;
const DropdownButton = Dropdown.Button;
const alertOperation = ({position, 
    columnList, 
    selectGroup, 
    extendColumnList, 
    checkCloumFunc, 
    relieveFunc, 
    dispatchFunc, 
    closeFunc, 
    mergeFunc, 
    groupFunc, 
    noGroupFunc,
    showChatOpsFunc }) => {

    const localeMessage = defineMessages({
      operate_dispatch: {
        id: 'alertOperate_dispatch',
        defaultMessage: '派发工单'
      },
      operate_close: {
        id: 'alertOperate_close',
        defaultMessage: '关闭告警'
      },
      operate_merge: {
        id: 'alertOperate_merge',
        defaultMessage: '合并告警'
      },
      operate_relieve: {
        id: 'alertOperate_relieve',
        defaultMessage: '解除告警'
      }
    })

    const setClass = classnames(
        styles['icon'],
        styles.iconfont,
        styles['icon-bushu']
    )

    // <Select className={styles.selectSingle} defaultValue="0">
    //     <Option value="0">抑制告警</Option>
    //     <Option value="1">5分钟内不再提醒</Option>
    //     <Option value="2">10分钟内不再提醒</Option>
    //     <Option value="3">半小时内不再提醒</Option>
    // </Select>

    const switchClass = classnames(
        styles['icon'],
        styles.iconfont,
        styles['icon-anonymous-iconfont']
    )

    const popoverContent = position === 'list' ?
            <div className={styles.popoverMain}>
                {
                    columnList.map( (group, index) => {
                        return (
                            <div key={index} className={styles.colGroup}>
                                <p>{group.name}</p>
                                {
                                    group.cols.map( (item, index) => {
                                        if (item.id === 'entityName' || item.id === 'name') {
                                            return <div key={index} className={styles.inlineItem}><Checkbox value={item.id} checked={true} disabled={true} >{item.name}</Checkbox></div>
                                        } else {
                                            return <div key={index} className={styles.inlineItem}><Checkbox value={item.id} checked={item.checked} onChange={ (e) => {
                                                checkCloumFunc(e)
                                            }}>{item.name}</Checkbox></div>
                                        }
                                    })
                                }
                            </div>
                        )
                    })
                }
            </div>
            :
            undefined
    const menu = (
        <Menu onClick={ relieveFunc }>
            <Menu.Item key="1" className={styles.menuItem}><FormattedMessage {...localeMessage['operate_relieve']} /></Menu.Item>
        </Menu>
    )
    return (
        <div className={styles.operateMain}>
            <Button className={styles.myButton} onClick={ () => {
                dispatchFunc(position)
            } } ><FormattedMessage {...localeMessage['operate_dispatch']} /></Button>
            <Button className={styles.myButton} onClick={ () => {
                closeFunc(position)
            }} ><FormattedMessage {...localeMessage['operate_close']} /></Button>
            {
                position !== 'detail' ?
                <DropdownButton overlay={menu} className={styles.myDropdown} trigger={['click']} onClick={ mergeFunc }>
                    <FormattedMessage {...localeMessage['operate_merge']} />
                </DropdownButton>
                :
                undefined
            }
            <Select className={styles.showChatOps}  placeholder='更多操作' onChange={ (operate) => {
                switch (operate) {
                    case 'ChatOps':
                        showChatOpsFunc(position)
                    break;
                    default:
                        () => {}
                    break;
                }
            }}>
                <Option value="ChatOps">分享到ChatOps</Option>
            </Select>
            {
                position !== 'detail' ?
                <div className={styles.groupMain}>
                    <Select className={classnames(styles.setGroup, styles.selectSingle)} placeholder="分组显示" value={selectGroup} onChange={ (value) => {
                        groupFunc(value)
                    }}>
                        <Option key={0} className={styles.menuItem} value="entityName">按对象分组</Option>
                        <Option key={1} className={styles.menuItem} value="source">按来源分组</Option>
                        <Option key={2} className={styles.menuItem} value="status">按状态分组</Option>
                        {
                            extendColumnList.length > 0 ? extendColumnList.map( (col, index) => {
                                return <Option key={index + 3} className={styles.menuItem} value={col.id}>{`按${col.name}分组`}</Option>
                            }) : <Option key='placeholder' style="display:none"></Option>
                        }
                    </Select>
                    <i className={selectGroup !== '分组显示' && classnames(switchClass, styles.switch)} onClick={noGroupFunc}></i>
                </div>
                :
                undefined
            }
            { position === 'list' 
                ? <Popover placement='bottomRight' trigger="click" content={popoverContent} >
                    <div className={classnames(styles.button, styles.rightBtn)}>
                        <i className={classnames(setClass, styles.setCol)}></i>
                        <p className={styles.col}>列定制</p>
                    </div>
                  </Popover>
                : undefined
            }
        </div>
    )
}

alertOperation.defaultProps = {
    position: 'list',
    columnList: [],
    selectGroup: '',
    extendColumnList: [],
    checkCloumFunc: () => {},
    relieveFunc: () => {},
    dispatchFunc: () => {},
    closeFunc: () => {},
    mergeFunc: () => {},
    groupFunc: () => {},
    noGroupFunc: () => {},
    showChatOpsFunc: () => {}
}

alertOperation.propTypes = {
    position: React.PropTypes.oneOf(['list', 'timeAxis', 'detail']).isRequired,
    columnList: React.PropTypes.array,
}

export default alertOperation