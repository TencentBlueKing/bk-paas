import { getStyle } from '@/common/util'

const Watcher = function () {
    this.events = {}
}

Watcher.prototype = {
    construct: Watcher,

    on (type, callback) {
        if (!this.events[type]) {
            this.events[type] = []
        }
        this.events[type].push(callback)

        return this
    },

    trigger (type) {
        const eventList = this.events[type] || []
        const params = Array.prototype.slice.call(arguments, 1)

        eventList.forEach(event => {
            event.apply(event, params)
        })

        return this
    },

    off (type, callback) {
        const eventList = this.events[type] || []

        if (!callback) {
            this.events[type] = []
            // delete this.events[type]
        } else {
            eventList.splice(eventList.indexOf(callback), 1)
        }

        return this
    }
}

export default function Drag (elem, option) {
    this.$elem = elem
    this.watcher = new Watcher()
    this.option = option || {}
    this.dragable = false
    this.container = document.body
    this.initOpts()
    this.init()
}

Drag.prototype = {
    constructor: Drag,
    initOpts () {
        if (typeof this.$elem === 'string') {
            this.$elem = document.querySelector(this.$elem)
        }
        if (this.option.container) {
            if (typeof this.option.container === 'string') {
                this.container = document.querySelector(this.option.container)
            } else {
                this.container = this.option.container
            }
        }
        this.containerWidth = parseFloat(getStyle(this.container, 'width'))
        this.containerHeight = parseFloat(getStyle(this.container, 'height'))

        // this.containerTop = getActualTop(this.container)
        // this.containerLeft = getActualLeft(this.container)
    },
    init () {
        const me = this
        const container = this.container
        me.dragable = false

        let hasMove = false

        const mousedown = e => {
            if (me.isChildren(e.target, container)) {
                me.dragable = true
            } else {
                me.dragable = false
                return
            }
            hasMove = false

            const $parent = me.$elem.offsetParent
            const diffX = e.clientX - me.$elem.offsetLeft
            const diffY = e.clientY - me.$elem.offsetTop
            const pDiffX = $parent.offsetLeft || 0
            const pDiffY = $parent.offsetTop || 0

            const elemWidth = me.$elem.offsetWidth
            const elemHeight = me.$elem.offsetHeight
            // const style = getComputedStyle(me.$elem)
            // const transition = style['transition'] || style['-webkit-transition'] || style['-moz-transition']
            // const zIndex = getComputedStyle(me.$elem).zIndex

            me.watcher.trigger('start', e, me.$elem)
            document.addEventListener('mousemove', move)

            me.containerWidth = parseFloat(getStyle(me.container, 'width'))
            me.containerHeight = parseFloat(getStyle(me.container, 'height'))

            function move (e) {
                if (!me.dragable) {
                    return
                }
                hasMove = true

                let left = e.clientX - diffX
                let top = e.clientY - diffY

                if (left + pDiffX < 0) {
                    left = left - (left + pDiffX)
                }
                if (top + pDiffY < 0) {
                    top = top - (top + pDiffY)
                }
                if (left + pDiffX + elemWidth > me.containerWidth) {
                    left = me.containerWidth - (pDiffX + elemWidth)
                }
                if (top + pDiffY + elemHeight > me.containerHeight) {
                    top = me.containerHeight - (pDiffY + elemHeight)
                }

                me.$elem.style.position = 'absolute'
                // me.$elem.style['transition'] = me.$elem.style['-webkit-transition'] = me.$elem.style['-moz-transition'] = 'unset'
                me.$elem.style.left = left + 'px'
                me.$elem.style.top = top + 'px'
                // me.$elem.style.zIndex = 99999999

                me.watcher.trigger('move', e, me.$elem)
            }

            document.addEventListener('mouseup', end)
            function end (e) {
                if (!me.dragable) {
                    return
                }
                me.$elem.removeEventListener('mousedown', mousedown)
                document.removeEventListener('mousemove', move)
                document.removeEventListener('mouseup', end)
                // me.$elem.style['transition'] = me.$elem.style['-webkit-transition'] = me.$elem.style['-moz-transition'] = transition
                // me.$elem.style.zIndex = zIndex
                if (hasMove) {
                    me.watcher.trigger('end', e, me.$elem)
                }
            }
        }
        me.$elem.addEventListener('mousedown', mousedown)
    },

    isChildren (element, parent) {
        let cur = element
        for (;cur.parentNode; cur = cur.parentNode) {
            if (cur === parent) {
                return true
            }
        }
        return false
    },

    on (type, callback) {
        this.watcher.on(type, callback)
        return this.watcher
    },

    off: function () {
        this.watcher.off.apply(this.watcher, arguments)
        return this.watcher
    }
}
