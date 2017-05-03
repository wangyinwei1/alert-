import React, { PropTypes, Component } from 'react'
import { connect } from 'dva'
import { getUUID } from '../../utils'
import AlertREST from './UYUN_Alert_REST'
import Monitor from './UYUN_Monitor'
import Itsm from './UYUN_Itsm'
import ChatOps from './UYUN_ChatOps'
import VideoMON from './UYUN_VideoMon'
import Trap from './SNMP_Trap'
import NetWork from './UYUN_NetWork'

function Edit(props){
    const { currentEditApp } = props.alertConfig;

    const editApplication = ({alertConfig, dispatch}) => {
        const { currentEditApp, apikey } = alertConfig;
        let targetApplication;
        let hostUrl = 'https://alert.uyun.cn';
        let origin = window.location.protocol + '//' +window.location.host;
        if (origin.indexOf("alert") > -1) {
            // 域名访问
            hostUrl = origin
            window.__alert_restApiUrl = hostUrl + '/openapi/v2/create?' + `api_key=${apikey}` + `&app_key=${currentEditApp.appKey}`
        } else {
            // 顶级域名/Ip访问
            hostUrl = origin + '/alert'
            window.__alert_restApiUrl = hostUrl + '/openapi/v2/create?' + `api_key=${apikey}` + `&app_key=${currentEditApp.appKey}`
        }
        console.log(currentEditApp.applyType.name)
        switch (currentEditApp.applyType.name) {
            case 'UYUN Alert REST API':
                targetApplication = 
                    <AlertREST 
                        appkey={currentEditApp.appKey}
                        displayName={currentEditApp.displayName}
                        builtIn={currentEditApp.builtIn}
                        url={hostUrl + '/openapi/v2/create?' + `api_key=${apikey}`}
                        onOk={(e, form) => {
                            e.preventDefault();
                            
                            form.validateFieldsAndScroll( (errors, values) => {
                                if (!!errors) {
                                    return;
                                }
                                const formData = form.getFieldsValue()
                                dispatch({
                                    type: 'alertConfig/editApplication',
                                    payload: formData
                                })
                            })
                        }}
                    />
                break;
            case 'UYUN Monitor':
                targetApplication = 
                    <Monitor 
                        appkey={currentEditApp.appKey}
                        displayName={currentEditApp.displayName}
                        builtIn={currentEditApp.builtIn}
                        url={hostUrl + '/openapi/v2/create?' + `api_key=${apikey}`}
                        onOk={(e, form) => {
                            e.preventDefault();
                            
                            form.validateFieldsAndScroll( (errors, values) => {
                                if (!!errors) {
                                    return;
                                }
                                const formData = form.getFieldsValue()
                                dispatch({
                                    type: 'alertConfig/editApplication',
                                    payload: formData
                                })
                            })
                        }}
                    />
                break;
            case 'UYUN NetWork':
                targetApplication = 
                    <NetWork 
                        appkey={currentEditApp.appKey}
                        displayName={currentEditApp.displayName}
                        builtIn={currentEditApp.builtIn}
                        url={hostUrl + '/openapi/v2/create?' + `api_key=${apikey}`}
                        onOk={(e, form) => {
                            e.preventDefault();
                            
                            form.validateFieldsAndScroll( (errors, values) => {
                                if (!!errors) {
                                    return;
                                }
                                const formData = form.getFieldsValue()
                                dispatch({
                                    type: 'alertConfig/editApplication',
                                    payload: formData
                                })
                            })
                        }}
                    />
                break;
            case 'SNMPTrap':
                targetApplication = 
                    <Trap 
                        appkey={currentEditApp.appKey}
                        displayName={currentEditApp.displayName}
                        builtIn={currentEditApp.builtIn}
                        url={hostUrl}
                        onOk={(e, form) => {
                            e.preventDefault();
                            
                            form.validateFieldsAndScroll( (errors, values) => {
                                if (!!errors) {
                                    return;
                                }
                                const formData = form.getFieldsValue()
                                dispatch({
                                    type: 'alertConfig/editApplication',
                                    payload: formData
                                })
                            })
                        }}
                    />
                break;
            case 'UYUN VideoMon':
                targetApplication = 
                    <VideoMON 
                        appkey={currentEditApp.appKey}
                        displayName={currentEditApp.displayName}
                        builtIn={currentEditApp.builtIn}
                        url={hostUrl + '/openapi/v2/create?' + `api_key=${apikey}`}
                        onOk={(e, form) => {
                            e.preventDefault();
                            
                            form.validateFieldsAndScroll( (errors, values) => {
                                if (!!errors) {
                                    return;
                                }
                                const formData = form.getFieldsValue()
                                dispatch({
                                    type: 'alertConfig/editApplication',
                                    payload: formData
                                })
                            })
                        }}
                    />
                break;
            case 'UYUN ITSM':
                targetApplication = 
                    <Itsm 
                        appkey={currentEditApp.appKey}
                        displayName={currentEditApp.displayName}
                        onOk={(e, form) => {
                            e.preventDefault();
                            
                            form.validateFieldsAndScroll( (errors, values) => {
                                if (!!errors) {
                                    return;
                                }
                                const formData = form.getFieldsValue()
                                dispatch({
                                    type: 'alertConfig/editApplication',
                                    payload: formData
                                })
                            })
                        }}
                    />
                break;
            case 'UYUN ChatOps':
                targetApplication = 
                    <ChatOps 
                        appkey={currentEditApp.appKey}
                        displayName={currentEditApp.displayName}
                        onOk={(e, form) => {
                            e.preventDefault();
                            
                            form.validateFieldsAndScroll( (errors, values) => {
                                if (!!errors) {
                                    return;
                                }
                                const formData = form.getFieldsValue()
                                dispatch({
                                    type: 'alertConfig/editApplication',
                                    payload: formData
                                })
                            })
                        }}
                    />
                break;
            default:
                targetApplication = 
                    <AlertREST 
                        appkey={currentEditApp.appKey}
                        displayName={currentEditApp.displayName}
                        builtIn={currentEditApp.builtIn}
                        url={hostUrl + '/openapi/v2/create?' + `api_key=${apikey}`}
                        onOk={(e, form) => {
                            e.preventDefault();
                            
                            form.validateFieldsAndScroll( (errors, values) => {
                                if (!!errors) {
                                    return;
                                }
                                const formData = form.getFieldsValue()
                                dispatch({
                                    type: 'alertConfig/editApplication',
                                    payload: formData
                                })
                            })
                        }}
                    />
                break;
        }
        return targetApplication
    }

    if (currentEditApp !== undefined && Object.keys(currentEditApp).length !== 0) {
        return editApplication(props)
    } else {
        return false;
    }
    
}
Edit.propTypes = {
  dispatch: PropTypes.func
}
export default connect(({alertConfig}) => ({alertConfig}))(Edit)
