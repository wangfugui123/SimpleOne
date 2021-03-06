/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow　主界面分页－所有－主题列表
 */

import React, {Component} from 'react'
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native'
import Read from '../read/Read'
import NetUtils from "../util/NetUtil"
import constants from "../Constants"
import ServerApi from '../ServerApi'
import PropTypes from 'prop-types'

let {width, height} = constants.ScreenWH
const VIEWABILITY_CONFIG = {
    minimumViewTime: 3000,
    viewAreaCoveragePercentThreshold: 100,
    waitForInteraction: true,
}

class AllListTopic extends Component {
    constructor(props) {
        super(props)
        this.renderRow = this.renderRow.bind(this)
        this.state = {}
        this.getTopicData = this.getTopicData.bind(this)
    }

    /**
     * 发起网络请求
     */
    componentDidMount() {
        this.getTopicData()
    }

    /**
     * 父组件传参变化回调
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        this.getTopicData()
    }

    render() {
        return (
            <View>
                {this.renderList()}
            </View>
        )
    }

    renderList() {
        if (this.state.dataSource !== null) {
            return (
                <FlatList data={this.state.dataSource}
                          renderItem={this.renderRow}
                          keyExtractor={(item, index) => item.id}
                          onViewableItemsChanged={(info) => {
                              console.log(info);
                          }}
                          viewabilityConfig={VIEWABILITY_CONFIG}
                >
                    }

                </FlatList>
            )
        }
    }

    // 单个item返回 线性布局
    renderRow(rowData) {
        // console.log(rowData);
        if (typeof(rowData) !== 'undefined') {
            return (
                <TouchableOpacity activeOpacity={0.5}
                                  onPress={() => this.pushToRead(rowData.item)}>
                    <View style={[styles.contentContainer, {
                        backgroundColor: constants.nightMode ? constants.nightModeGrayLight : 'white',
                        borderBottomColor: constants.nightMode ? constants.nightModeGrayDark : constants.itemDividerColor
                    }]}>
                        {this.renderImage(rowData)}
                        {/*下面的文字*/}
                        <Text
                            style={[styles.bottomText, {color: constants.nightMode ? 'white' : constants.normalTextColor}]}>
                            {rowData.item.title}
                        </Text>
                    </View>


                </TouchableOpacity>
            )
        }
    }


    /*上面的图片*/
    renderImage(rowData) {
        return (
            <Image source={{uri: rowData.item.cover}}
                   style={styles.TopImage}/>
        )
    }

    // 请求专题数据
    getTopicData() {
        console.log('请求topic')
        let itemArr = [] //把显示数据放到一个数组里
        let url = ServerApi.AllTopic.replace('{id}', this.props.startId)
        NetUtils.get(url, null, (result) => {
            this.setState({
                topic: result,
            })
            let end = false
            if (result.data.length >= this.props.showNum) {
                for (let i = 0; i < this.props.showNum; i++) {
                    // console.log(this.state.topic.data[i]);
                    itemArr.push(result.data[i])
                }
                console.log('调用回调' + this.state.topic.data[this.props.showNum - 1].id + ":" + end);
                this.setState({
                    endId: result.data[this.props.showNum - 1].id
                })
                this.props.getEndId(result.data[this.props.showNum - 1].id, end)
            }
            //如果专题的数据数量小于显示数量，直接全部放进去
            else {
                for (let i = 0; i < result.data.length; i++) {
                    // console.log(this.state.topic.data[i]);
                    itemArr.push(result.data[i])
                }
                end = true
                this.setState({
                    endId: result.data[result.data.length - 1].id
                })
                console.log('调用回调' + result.data[result.data.length - 1].id + ":" + end);
                this.props.getEndId && this.props.getEndId(result.data[result.data.length - 1].id, end)
            }
            //将这个数组作为数据源
            this.setState({
                dataSource: itemArr,
            })
            this.props.onSuccess && this.props.onSuccess()
        }, (error) => {
            this.props.onError && this.props.onError()
            console.log('错误' , error)
        })
    }

    /**
     * 跳转到阅读页
     * @param url
     */
    pushToRead(rowData) {
        this.props.navigator.push(
            {
                component: Read,
                title: '阅读',
                params: {
                    contentId: rowData.content_id,
                    contentType: rowData.category,
                    entry: constants.AllRead
                }
            }
        )
    }
}

AllListTopic.propsTypes = {
    onError: PropTypes.func,
    onSuccess: PropTypes.func,
    showNum: PropTypes.number.isRequired,
    startId: PropTypes.number.isRequired,
    endId: PropTypes.number.isRequired,
    getEndId: PropTypes.func.isRequired
}

AllListTopic.defaultProps = {
    showNum: 10,//展示个数
    startId: 0,  //请求起始id
    endId: 0, //结束id
}

const styles = StyleSheet.create({
    contentContainer: {
        justifyContent: 'center',
        borderBottomWidth: width * 0.028,
    },

    TopImage: {
        margin: width * 0.045,
        width: width * 0.9,
        height: width * 0.54,
    },
    bottomText: {
        marginLeft: width * 0.045,
        marginRight: width * 0.045,
        marginTop: width * 0.01,
        marginBottom: width * 0.04,
        fontSize: width * 0.042
    }
})

export default AllListTopic
