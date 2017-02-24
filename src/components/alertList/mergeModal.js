import React, { PropTypes, Component } from 'react'
import { connect } from 'dva'
import { Modal, Button, Table } from 'antd';
import styles from './index.less'
import mergeStyles from './mergeModal.less'
import LevelIcon from '../common/levelIcon/index.js'
import { classnames } from '../../utils'

const mergeModal = ({alertOperation, dispatch}) => {

    const { isShowMergeModal, mergeInfoList, originAlert } = alertOperation;
    
    const closeMergeModal = () => {
        dispatch({
            type: 'alertOperation/toggleMergeModal',
            payload: false
        })
    }

    const modalFooter = []
    modalFooter.push(<div className={styles.modalFooter}>
      <Button type="primary" disabled={originAlert !== undefined && originAlert.length == 0 ? true : false} onClick={ () => {
        dispatch({
            type: 'alertOperation/mergeAlert',
        })
      }} >合并</Button>
      <Button type="ghost" onClick={ () => {
        dispatch({
            type: 'alertOperation/toggleMergeModal',
            payload: false
        })
        dispatch({
            type: 'alertOperation/selectRows',
            payload: []
        })
      }}>取消</Button>
      </div>
    )

    const rowSelection = {
        type: 'radio',
        selectedRowKeys: originAlert,
        onChange: (selectedRowKeys) => {
            dispatch({
                type: 'alertOperation/selectRows',
                payload: selectedRowKeys,
            })
        }
    }

    return (
        <Modal
          title="合并告警"
          maskClosable="true"
          onCancel={ closeMergeModal }
          visible={ isShowMergeModal }
          footer={ modalFooter }
          width={900}
        >
            <div>
                <p className={mergeStyles.title}>合并告警前，请选择一条告警做源告警</p>
                <Table
                    columns={ [
                        {
                            key: 'icon',
                            render: (text, record, index) => {
                                return <LevelIcon key={index} iconType='jj' /> 
                            }
                        },
                        {
                            title: '对象',
                            key: 'object',
                            dataIndex: 'object'
                        },
                        {
                            title: '告警名称',
                            key: 'name',
                            dataIndex: 'name'
                        },
                        {
                            title: '来源',
                            key: 'origin',
                            dataIndex: 'origin'
                        },
                        {
                            title: '告警描述',
                            key: 'descipition',
                            dataIndex: 'descipition'
                        },
                        {
                            title: '持续时间',
                            key: 'time',
                            dataIndex: 'time'
                        },
                        {
                            title: '操作',
                            key: 'operation',
                            render: (text, record) => {
                                return <a className={mergeStyles.remove} href="javascript:void(0)" onClick={ () => {
                                    dispatch({
                                        type: 'alertOperation/removeAlert',
                                        payload: record.id,
                                    })
                                }} >移除</a>
                            }
                        }
                    ]}

                    rowKey={ record => record.id }
                    dataSource={ mergeInfoList }
                    rowSelection={ rowSelection }
                    pagination={false}

                ></Table>
            </div>
        </Modal>
    )
}

mergeModal.defaultProps = {

}

mergeModal.propTypes = {

}

export default connect( state => {
    return {
        alertOperation: state.alertOperation,
    }
})(mergeModal);