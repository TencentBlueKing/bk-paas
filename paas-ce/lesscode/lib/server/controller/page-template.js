import { getConnection, getRepository, In } from 'typeorm'
import _ from 'lodash'
import PageTemplate from '../model/entities/page-template'
import * as TemplateCategoryModel from '../model/page-template-category'
import * as PageTemplateModel from '../model/page-template'
import Func from '../model/entities/func'
import Variable from '../model/entities/variable'
import FuncModel from '../model/function'
import VariableModel from '../model/variable'
import FuncVariable from '../model/entities/func-variable'

export const listByCategory = async (ctx) => {
    try {
        const { projectId } = ctx.query
        const params = {}
        if (projectId) {
            params.belongProjectId = projectId
        }
        const categorys = await TemplateCategoryModel.all(params)
        
        const templates = await PageTemplateModel.all(params)

        const list = categorys.map(category => {
            const templateList = templates.filter(item => item.categoryId === category.id) || []
            return {
                categoryName: category.name,
                list: templateList
            }
        })

        ctx.send({
            code: 0,
            message: 'success',
            data: list
        })
    } catch (err) {
        ctx.throwError({
            message: err.message
        })
    }
}

export const list = async (ctx) => {
    try {
        const { projectId, categoryId, type } = ctx.query

        const params = {}
        if (projectId) {
            params.belongProjectId = projectId
        }
        if (categoryId) {
            params.categoryId = categoryId
        }
        if (type === 'OFFCIAL') {
            params.isOffcial = 1
        }
        const res = await PageTemplateModel.all(params)
        ctx.send({
            code: 0,
            message: 'success',
            data: res || []
        })
    } catch (err) {
        ctx.throwError({
            message: err.message
        })
    }
}

export const create = async (ctx) => {
    try {
        const { params } = ctx.request.body

        // 模板名称已存在
        const record = await PageTemplateModel.getOne({
            templateName: params.templateName,
            belongProjectId: params.belongProjectId,
            deleteFlag: 0
        })
        if (record) {
            ctx.throwError({
                message: '模板名称已存在'
            })
        }
        const createTemplate = getRepository(PageTemplate).create(params)
        const res = await getRepository(PageTemplate).save(createTemplate)
        ctx.send({
            code: 0,
            message: 'success',
            data: res && res.id
        })
    } catch (err) {
        ctx.throw(err)
    }
}

export const detail = async (ctx) => {
    try {
        const { id } = ctx.request.query
        const template = await PageTemplateModel.findById(id) || {}
        ctx.send({
            code: 0,
            message: 'success',
            data: template
        })
    } catch (err) {
        ctx.throwError({
            message: err.message || err
        })
    }
}

// check符合条件的pageTemplate是否已存在
export const checkIsExist = async (ctx) => {
    try {
        const params = ctx.request.body
        let isExist = false
        
        const record = await PageTemplateModel.getOne({
            ...params,
            deleteFlag: 0
        })
        if (record) {
            isExist = true
        }
        ctx.send({
            code: 0,
            message: `success`,
            data: isExist
        })
    } catch (err) {
        ctx.throwError({
            message: err.message || err
        })
    }
}

// 应用模板
export const apply = async (ctx) => {
    try {
        const { id, fromProjectId, templateInfo, valList = [], funcList = [] } = ctx.request.body
        const preTemplate = await PageTemplateModel.findById(id) || {}

        const { content, previewImg, fromPageCode, templateName } = preTemplate

        await Promise.all(templateInfo.map(async fromTemplate => {
            const { categoryId, belongProjectId } = fromTemplate
            const newTemplate = {
                content,
                previewImg,
                isOffcial: 0,
                offcialType: '',
                categoryId,
                templateName: fromTemplate.templateName || templateName,
                parentId: id,
                belongProjectId,
                fromPageCode
            }
            
            const { varIds, funcIds, defaultFuncGroupId } = await getRealVarAndFunc({ projectId: belongProjectId, fromProjectId, valList, funcList })
            console.log(belongProjectId, varIds, funcIds, defaultFuncGroupId, 'ids')
            await getConnection().transaction(async transactionalEntityManager => {
                const createTemplate = getRepository(PageTemplate).create(newTemplate)
                const res = await transactionalEntityManager.save(createTemplate)
                const saveQueue = []
                if (varIds.length) {
                    await Promise.all(varIds.map(async valId => {
                        const val = await getRepository(Variable).findOne(valId)
                        const { id, createTime, createUser, updateTime, updateUser, ...other} = val
                        const newVal = Object.assign(other, {
                            projectId: belongProjectId,
                            pageCode: '',
                            effectiveRange: 0
                        })
                        const createVal = getRepository(Variable).create(newVal)
                        saveQueue.push(transactionalEntityManager.save(createVal))
                    }))
                }
                if (funcIds.length) {
                    await Promise.all(funcIds.map(async funcId => {
                        const func = await getRepository(Func).findOne(funcId)
                        const { id, createTime, createUser, updateTime, updateUser, ...other} = func
                        const newFunc = Object.assign(other, { 
                            funcGroupId: defaultFuncGroupId
                        })
                        const createFunc = getRepository(Func).create(newFunc)
                        saveQueue.push(transactionalEntityManager.save(createFunc))
                        
                    }))
                }
                saveQueue.length && await Promise.all(saveQueue)
            })
        }))
        
        ctx.send({
            code: 0,
            message: `success`,
            data: `模板添加至项目成功`
        })
    } catch (err) {
        ctx.throwError({
            message: err.message || err
        })
    }
}

const getRealVarAndFunc = async ({ projectId, fromProjectId, valList, funcList }) => {
    let varIds = []
    const funcIds = []
    const funcCodes = []
    const projectValList = await VariableModel.getAll({ projectId, effectiveRange: 0 })
    const projectFuncGroupList = await FuncModel.allGroupFuncDetail(projectId)
    const projectFuncList = []
    projectFuncGroupList.map(item => {
        projectFuncList.splice(0, 0, ...item.functionList)
    })
    const defaultFuncGroupId = projectFuncGroupList[0] && projectFuncGroupList[0].id
    funcList.map(func => {
        if (projectFuncList.filter(item => item.funcCode === func.funcCode).length === 0) {
            funcIds.push(func.id)
            funcCodes.push(func.funcCode)
        }
    })
    // 找出函数中使用的变量
    const funcVarList = await getRepository(FuncVariable).find({
        where: {
            projectId: fromProjectId,
            deleteFlag: 0,
            funcCode: In(funcCodes)
        }
    })
    // 直接绑定的变量和函数使用到的变量放在变量列表
    funcVarList.map(item => {
        valList.push({ id: item.variableId.toString() })
    })
    valList.map(val => {
        if (projectValList.filter(item => item.id === val.id).length === 0) {
            varIds.push(val.id)
        }
    })
    // 变量id去重
    varIds = Array.from(new Set(varIds))
    return { varIds, funcIds, defaultFuncGroupId }
}

// 编辑模板
export const update = async (ctx) => {
     try {
        const { id, params } = ctx.request.body

        // 模板名称已存在
        const record = await PageTemplateModel.getOne({
            templateName: params.templateName,
            belongProjectId: params.belongProjectId,
            deleteFlag: 0
        })
        if (record && record.id !== id) {
            ctx.throwError({
                message: '模板名称重复'
            })
        }
        const res = await PageTemplateModel.updateById(id, params)
        ctx.send({
            code: 0,
            message: 'success',
            data: res
        })
     } catch (err) {
        ctx.throwError({
            message: err.message || err
        })
     }
}

export const deleteTemplate = async (ctx) => {
    try {
        const res = PageTemplateModel.remove(ctx.query.templateId)
        ctx.send({
            code: 0,
            message: 'success',
            data: res && res.id
        })
    } catch (err) {
        ctx.throw(err)
    }
}

// 分类组件数量
export const categoryCount = async (ctx) => {
    try {
        const belongProjectId = parseInt(ctx.query.projectId)
        if (!belongProjectId) {
            throw new Error('项目id不能为空')
        }
        const res = await getRepository(PageTemplate)
            .createQueryBuilder()
            .select('categoryId')
            .addSelect('COUNT(id)', 'count')
            .where({
                deleteFlag: 0,
                belongProjectId
            })
            .groupBy('categoryId')
            .getRawMany()

        ctx.send({
            code: 0,
            message: 'success',
            data: res
        })
    } catch (error) {
        ctx.send({
            code: -1,
            message: error.message,
            data: null
        })
    }
}



