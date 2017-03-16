import React, { PropTypes, Component } from 'react'
import { Select, Popover, Checkbox, Dropdown, Menu, Button } from 'antd';
import { connect } from 'dva'
import styles from './index.less'
import { classnames } from '../../../utils'

const Option = Select.Option;
const DropdownButton = Dropdown.Button;
const alertOperation = ({position, columnList, selectGroup, checkCloumFunc, relieveFunc, dispatchFunc, closeFunc, mergeFunc, groupFunc, noGroupFunc, initCloumFunc}) => {

    const setClass = classnames(
        styles['icon'],
        styles.iconfont,
        styles['icon-bushu']
    )

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
                                        if (item.id === 'entity' || item.id === 'alertName') {
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
            <Menu.Item key="1" className={styles.menuItem}>解除告警</Menu.Item>
        </Menu>
    )
    return (
        <div className={styles.operateMain}>
            <Button className={styles.myButton} onClick={ () => {
                dispatchFunc(position)
            } } >派发工单</Button>
            <Button className={styles.myButton} onClick={ () => {
                closeFunc(position)
            }} >关闭告警</Button>
            {
                position !== 'detail' ?
                <DropdownButton overlay={menu} className={styles.myDropdown} trigger={['click']} onClick={ mergeFunc }>
                    合并告警
                </DropdownButton>
                :
                undefined
            }
            <Select className={styles.selectSingle} defaultValue="0">
                <Option value="0">抑制告警</Option>
                <Option value="1">5分钟内不再提醒</Option>
                <Option value="2">10分钟内不再提醒</Option>
                <Option value="3">半小时内不再提醒</Option>
            </Select>
            <Select className={styles.selectSingle} defaultValue="0">
                <Option value="0">更多操作</Option>
                <Option value="1">转交他人</Option>
                <Option value="2">分享到ChatOps</Option>
                <Option value="3">添加备注</Option>
            </Select>
            {
                position !== 'detail' ?
                <div className={styles.groupMain}>
                    <Select className={classnames(styles.setGroup, styles.selectSingle)} placeholder="分组显示" value={selectGroup} onChange={ (value) => {
                        groupFunc(value)
                    }}>
                        <Option className={styles.menuItem} value="ENTITY_NAME">按来源分组</Option>
                        <Option className={styles.menuItem} value="status">按状态分组</Option>
                        <Option className={styles.menuItem} value="severity">按级别分组</Option>
                    </Select>
                    <i className={selectGroup !== '分组显示' && classnames(switchClass, styles.switch)} onClick={noGroupFunc}></i>
                </div>
                :
                undefined
            }
            { position === 'list' 
                ? <Popover placement='bottomRight' trigger="click" content={popoverContent} onClick={ initCloumFunc }>
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
    checkCloumFunc: () => {},
    relieveFunc: () => {},
    dispatchFunc: () => {},
    closeFunc: () => {},
    mergeFunc: () => {},
    groupFunc: () => {},
    noGroupFunc: () => {},
    initCloumFunc: () => {}
}

alertOperation.propTypes = {
    position: React.PropTypes.oneOf(['list', 'timeAxis', 'detail']).isRequired,
    columnList: React.PropTypes.array,

}

export default alertOperation