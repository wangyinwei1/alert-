import React, { PropTypes, Component } from 'react'
import { findDOMNode } from 'react-dom';
import styles from './index.less'
import { classnames } from '../../../utils'
import Animate from 'rc-animate'
import KeyCode from 'rc-util/lib/KeyCode';
import scrollIntoView from 'dom-scroll-into-view';
import DOMWrap from './Domwrap.js'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl';
import $ from 'jquery'

class tagsGroup extends Component{

    constructor(props) {
        super(props)
        this.timer = null;
        this.state = {
          current: props.selectList || [], // 当前数组行
          currentIndex: 0 // 当前活跃行
        }
        this.isNodeInRoot = this.isNodeInRoot.bind(this)
        this.changeBykeyBoard = this.changeBykeyBoard.bind(this)
    }

    changeBykeyBoard(event) {
        if( this.props.content && this.props.content.visible && this.state.current.length > 0 ) {
          let currentIndex = this.state.currentIndex;
          switch (event.keyCode) {
            case KeyCode.UP:
              if(currentIndex < 1) {
                currentIndex = this.state.current.length - 1;
              } else {
                currentIndex--
              }
              this.setState({ currentIndex })
              break;
            case KeyCode.DOWN:
              if(currentIndex < this.state.current.length - 1) {
                currentIndex++
              } else {
                currentIndex = 0;
              }
              this.setState({ currentIndex })
              break;
            case KeyCode.ENTER:
              this.props.changeHandler({
                field: this.props.content.key,
                item: this.props.selectList && this.props.selectList[currentIndex]
              })
              break;
            default:
              break;
          }
          if (this.refs.domWrap.getInnerMenu(currentIndex)) {
            scrollIntoView(this.refs.domWrap.getInnerMenu(currentIndex), findDOMNode(this.refs.domWrap), {
              onlyScrollIfNeeded: true,
            })
          }
        }
        return
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectList !== this.props.selectList) {
          this.setState({
            current: nextProps.selectList || [],
            currentIndex: 0
          })
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.changeBykeyBoard, false)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.changeBykeyBoard, false)
    }

    isNodeInRoot(node, root) {
        // vislble = false 没有实例的情况
        if (typeof root === 'undefined') {
          return false;
        }
        while(node) {
            if(node === root) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }

    visible(target, e) {
        e.stopPropagation();

        let root = this.containerNode;
        if (!this.isNodeInRoot(e.target, root) && this.props.setVisible) {
            this.props.setVisible(target)
        }
    }

    renderName(key, name) {
        if (key == 'severity' || key == 'status') {
            return <p>{ window[`_${key}`][name] }</p>
        } else {
            return <p>{ name }</p>
        }
    }

    renderQueryContent(content, formatMessage, localeMessage) {
        const sousuo = classnames(
            'icon',
            'iconfont',
            'icon-sousuo'
        )
        return (
          <div className={styles.tagsContent} ref={node => this.containerNode = node} >
            <div className={styles.query}>
              <i className={classnames(sousuo, styles.sousuo)} />
              <input ref={node => this.inputNode = node} type='text' placeholder={formatMessage(localeMessage['keyword'])} onChange={ (e) => {
                  e.persist();
                  clearTimeout(this.timer)
                  this.timer = setTimeout( () => {
                      this.props.queryTagValues(content.key, e.target.value)
                  }, 500)
              }} onFocus={ (e) => {
                e.stopPropagation();
                this.props.queryTagValues(content.key, '')
              }} />
            </div>
            <DOMWrap
              tag='ul'
              ref='domWrap'
              selectList={this.props.selectList}
              currentIndex={this.state.currentIndex}
              changeHandler={(target) => {
                this.props.changeHandler({
                  field: content.key,
                  item: target
                })
                this.inputNode.value = '';
              }}
              loadMore={ () => {
                this.props.loadMore(content.key, this.inputNode.value)
              }}
            />
          </div>
        )
    }

    render() {
        let {className, removeHandler, content, haveTags, intl: {formatMessage}} = this.props;

        const localeMessage = defineMessages({
          placeholder: {
              id: 'modal.tag.select',
              defaultMessage: '请选择{name}'
          },
          keyword: {
              id: 'modal.tag.keywords',
              defaultMessage: '请输入关键字搜索'
          }
        })

        const switchClass = classnames(
            'icon',
            'iconfont',
            'icon-anonymous-iconfont'
        )

        return (
            haveTags ?
            <div className={className} onClick={this.visible.bind(this, ...arguments, content)}>
                <p className={styles.typeName}>{`${ content.keyName }:`}</p>
                {
                    content.values.map( (item, index) => {
                        return (
                            <div key={ index } className={styles.mark}>
                                {this.renderName(content.key, item)}
                                <i className={switchClass}
                                data-id={JSON.stringify({field: content.key, name: item})}
                                onClick={(e) => removeHandler(e)}></i>
                            </div>
                        )
                    })
                }
                <Animate
                    transitionName="tags"
                    transitionLeaveTimeout={300}
                >
                {content.visible && this.renderQueryContent(content, formatMessage, localeMessage)}
                </Animate>
            </div>
            :
            <div className={className} onClick={this.visible.bind(this, ...arguments, content)}>
                <p className={styles.typeName}>{`${ content.keyName }:`}</p>
                <span className={styles.placeholder}>{formatMessage(localeMessage['placeholder'], {name: `${content.keyName}`})}</span>
                <Animate
                    transitionName="tags"
                    transitionLeaveTimeout={300}
                >
                {content.visible && this.renderQueryContent(content, formatMessage, localeMessage)}
                </Animate>
            </div>
        )
    }
}

tagsGroup.defaultProps = {
    className: styles.tagsGroupMain,
    removeHandler: () => {},
    content: {},
    setVisible: () => {}
}

tagsGroup.propTypes = {
    haveTags: React.PropTypes.bool.isRequired,
    className: React.PropTypes.string.isRequired,
    content: React.PropTypes.object.isRequired,
    removeHandler: React.PropTypes.func.isRequired,
    setVisible: React.PropTypes.func.isRequired
}

export default injectIntl(tagsGroup);
