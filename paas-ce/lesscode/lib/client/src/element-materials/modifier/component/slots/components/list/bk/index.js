const bkListMap = {
    'bk-radio': {
        template: [
            {
                name: 'label',
                key: 'label',
                type: 'input'
            }, {
                name: 'value',
                key: 'value',
                type: 'input'
            }, {
                name: '默认选中',
                key: 'checked',
                type: 'radio'
            }
        ],
        generateFunc: index => ({
            label: `单选项${index}`,
            value: `单选项${index}`,
            checked: false
        })
    },
    'bk-radio-button': {
        template: [
            {
                name: 'label',
                key: 'label',
                type: 'input'
            }, {
                name: 'value',
                key: 'value',
                type: 'input'
            }, {
                name: '是否禁用',
                key: 'disabled',
                type: 'checkbox'
            }
        ],
        generateFunc: index => ({
            label: `选项${index}`,
            value: `选项${index}`,
            checked: false
        })
    },
    
    'bk-checkbox': {
        template: [
            {
                name: 'label',
                key: 'label',
                type: 'input'
            }, {
                name: 'value',
                key: 'value',
                type: 'input'
            }, {
                name: '默认选中',
                key: 'checked',
                type: 'checkbox'
            }
        ],
        generateFunc: index => ({
            label: `选项${index}`,
            value: `选项${index}`,
            checked: false
        })
    },
    'bk-breadcrumb-item': {
        template: [
            {
                name: 'label',
                key: 'label',
                type: 'input'
            }, {
                name: 'to',
                key: 'to',
                type: 'input'
            }
        ],
        generateFunc: index => ({
            label: `面包屑${index}`,
            to: null
        })
    },
    'bk-step': {
        template: [
            {
                name: 'title',
                key: 'title',
                type: 'input'
            }, {
                name: 'icon',
                key: 'icon',
                type: 'icon'
            }, {
                name: '步骤描述',
                key: 'description',
                type: 'input'
            }
        ],
        generateFunc: index => ({
            title: `步骤${index}`,
            icon: index,
            description: ''
        })
    },
    'bk-option': {
        template: [
            {
                name: '选项id',
                key: 'id',
                type: 'input'
            }, {
                name: '选项name',
                key: 'name',
                type: 'input'
            }
        ],
        generateFunc: index => ({
            id: `option${index}`,
            'name': ''
        })
    },
    'bk-tab-panel': {
        template: [
            {
                name: 'label',
                key: 'label',
                type: 'input'
            }, {
                name: 'name',
                key: 'name',
                type: 'input'
            }
        ],
        generateFunc: index => ({
            label: `Tab-${index}`,
            'name': `Tab-${index}`
        })
    },
    'bk-timeline': {
        template: [
            {
                name: '内容',
                key: 'label',
                type: 'input'
            }, {
                name: '时间戳',
                key: 'timestamp',
                type: 'input'
            },
            {
                name: 'color',
                key: 'color',
                type: 'input'
            }
        ],
        generateFunc: index => ({
            label: `Timeline-${index}`,
            timestamp: '2021-06-29',
            color: ''
        })
    }
}

export default bkListMap
