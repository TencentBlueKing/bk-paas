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
const compressing = require('compressing')
const send = require('koa-send')
const path = require('path')
const fse = require('fs-extra')

/**
 * 输出 json
 */
export const OutputJson = () => {
    return (target, propertyKey, descriptor) => {
        const originValue = descriptor.value
        descriptor.value = async (ctx) => {
            try {
                const data = await originValue.apply(this, [ctx])
                ctx.send({ code: 0, message: 'success', data })
            } catch (error) {
                ctx.throwError(error)
            }
        }
    }
}

/**
 * 输出文件压缩包，前端使用浏览器自动下载
 * 接口返回 { zipName： 压缩包文件名，默认 lesscode.zip, fileList: [{ filename: 文件名， content： 文件内容 }] }
 */
export const OutputZip = () => {
    return (target, propertyKey, descriptor) => {
        const originValue = descriptor.value
        descriptor.value = async (ctx) => {
            const downloadTempPath = './lib/server/downloadTemp/'
            let curDownLoadDirPath
            let curDownLoadZipDirPath
            try {
                const { fileList, zipName } = await originValue.apply(this, [ctx])
                curDownLoadDirPath = path.join(downloadTempPath, zipName)
                curDownLoadZipDirPath = path.join(downloadTempPath, zipName)
                // 确保下载临时目录有
                await fse.ensureDir(downloadTempPath)
                await fse.ensureDir(curDownLoadDirPath)
                await fse.ensureDir(curDownLoadZipDirPath)
                // 生成 zip
                const curDownLoadZipPath = path.join(curDownLoadZipDirPath, `${zipName}.zip`)
                fileList.forEach((file) => {
                    const name = file.name || zipName
                    const filePath = path.join(curDownLoadDirPath, name)
                    fse.writeFileSync(filePath, file.content, 'utf8')
                })
                await compressing.zip.compressDir(curDownLoadDirPath, curDownLoadZipPath)
                // send
                ctx.attachment(curDownLoadZipPath)
                await send(ctx, curDownLoadZipPath)
            } catch (error) {
                ctx.throwError(error)
            } finally {
                if (curDownLoadDirPath) fse.remove(curDownLoadDirPath)
                if (curDownLoadZipDirPath) fse.remove(curDownLoadZipDirPath)
            }
        }
    }
}
