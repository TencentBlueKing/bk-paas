/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/**
 * 业务错误，用于非500错误信息，由接口自行处理错误
 * @param {*} message // 错误的信息，非必填，默认 “服务器出现业务错误”
 * @param {*} code // 错误码，非必填，默认 499
 * @param {*} data // 错误数据，非必填
 */
function BusinessError (message = '服务器错误', code = -1, status = 200, stack = (new Error()).stack) {
    this.name = 'BusinessError'
    this.status = status
    this.message = message
    this.code = code
    this.data = null
    this.stack = stack
}
BusinessError.prototype = Object.create(Error.prototype)
BusinessError.prototype.constructor = BusinessError

global.BusinessError = BusinessError
