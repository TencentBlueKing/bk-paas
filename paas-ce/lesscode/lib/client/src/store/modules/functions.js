/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import { messageHtmlError } from '../../common/bkmagic'
import http from '@/api'
const perfix = '/function'

export default {
    namespaced: true,
    state: {
        funcGroups: []
    },
    mutations: {
    },
    getters: {
        funcGroups: state => state.funcGroups
    },
    actions: {
        getAllGroupFuncs ({ state }, params, isCommit = true) {
            return http.get(`${perfix}/getAllGroupFunc`, { params }).then((res = {}) => {
                isCommit && (state.funcGroups = res.data || [])
                return res.data || []
            })
        },

        bulkAddFunc ({ state }, { groupId, funcList, varWhere }) {
            return http.post(`${perfix}/bulkAddFunction`, { funcList, varWhere }).then((res = {}) => {
                if (res.code === 499) {
                    messageHtmlError(res.message)
                    return
                }
                const newFuncs = res.data || []
                const curGroup = state.funcGroups.find((group) => (group.id === groupId)) || {}
                curGroup.functionList.unshift(...newFuncs)
                return newFuncs
            })
        },

        addFunc ({ state }, { groupId, func, varWhere }) {
            return http.post(`${perfix}/addFunction`, { func, varWhere }).then((res = {}) => {
                if (res.code === 499) {
                    messageHtmlError(res.message)
                    return
                }
                const newFunc = res.data || {}
                const curGroup = state.funcGroups.find((group) => (group.id === groupId)) || {}
                curGroup.functionList.unshift(newFunc)
                return newFunc
            })
        },

        deleteFunc ({ state }, { groupId, funcId, projectId, funcName }) {
            return http.delete(`${perfix}/deleteFunction`, { params: { id: funcId, projectId, funcName } }).then(() => {
                const groups = state.funcGroups
                const curGroup = groups.find(x => x.id === groupId)
                const funcIndex = curGroup.functionList.findIndex((func) => (func.id === funcId))
                curGroup.functionList.splice(funcIndex, 1)
            })
        },

        editFunc ({ state }, { func, varWhere }) {
            return http.put(`${perfix}/editFunction`, { func, varWhere }).then((res) => {
                if (res.code === 499) {
                    messageHtmlError(res.message)
                    return
                }
                const data = res.data || []
                const newFunc = data[0] || {}
                return newFunc
            })
        },

        addGroup ({ state }, data) {
            return http.post(`${perfix}/addFuncGroup`, data).then((res = {}) => {
                const newGroup = res.data || {}
                state.funcGroups.push(...newGroup)
            })
        },

        deleteGroup ({ state }, params) {
            return http.delete(`${perfix}/deleteFuncGroup`, { params }).then(() => {
                const index = state.funcGroups.findIndex((group) => (group.id === params.id))
                state.funcGroups.splice(index, 1)
            })
        },

        editGroups ({ state }, groups) {
            groups = JSON.parse(JSON.stringify(groups))
            const copyGroups = state.funcGroups
            groups.forEach((group) => {
                const curGroup = copyGroups.find(x => x.id === group.id)
                Object.assign(curGroup, group)
            })
            state.funcGroups.sort((pre, next) => (pre.order - next.order))
            return http.put(`${perfix}/editFuncGroups`, groups)
        },

        fixFunByEslint (_, func) {
            return http.post(`${perfix}/fixFunByEslint`, func)
        }
    }
}
