// components/dragable/dragable.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    left: {
      type: Number,
      value: 0
    },
    top: {
      type: Number,
      value: 0
    },
    width: {
      type: Number,
      value: 0
    },
    height: {
      type: Number,
      value: 0
    },
    gap: {
      type: Number,
      value: 3
    },
    rects: {
      type: Array,
      value: []
    }
  },
  observers: {
    "leftConnected": function(val) {
      if (this.data.leftConnectedStatus !== val) {
        wx.vibrateShort()
        this.setData({
          leftConnectedStatus: val
        })
      }
    },
    "topConnected": function(val) {
      if (this.data.topConnectedStatus !== val) {
        wx.vibrateShort()
        this.setData({
          topConnectedStatus: val
        })
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    startX: 0,
    startY: 0,
    control: null,
    leftConnectedStatus: false,
    topConnectedStatus: false,
    leftConnected: false,
    topConnected: false,
    guide: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      center: 0,
      middle: 0
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTouchStart (e) {
      const { guide } = this.data
      const touch = e.touches[0]
      const { clientX, clientY } = touch
      const { control } = e.target.dataset

      this.setData({
        startX: clientX,
        startY: clientY,
        control: control ? control.split(',').map(item => item.trim()) : null
      })
      wx.nextTick(() => {
        this.triggerEvent('dragstart', { guide })
      })
    },
    onTouchMove (e) {
      const touch = e.changedTouches[0]
      const { clientX, clientY } = touch
      const { startX, startY, left, top, width, height, control, leftConnected, topConnected, gap } = this.data
      let deltaX = clientX - startX
      let deltaY = clientY - startY
      let targetObj = {}
      let widthNegtive = control && control.includes('left')
      let heightNegtive = control && control.includes('top')

      deltaX = deltaX > 0 ? Math.ceil(deltaX) : Math.floor(deltaX)
      deltaY = deltaY > 0 ? Math.ceil(deltaY) : Math.floor(deltaY)

      let temp = {
        left: left + (leftConnected && Math.abs(deltaX) < gap ? 0 : deltaX),
        top: top + (topConnected && Math.abs(deltaY) < gap ? 0 : deltaY),
        width: widthNegtive ? width - deltaX : width + deltaX,
        height: heightNegtive ? height - deltaY : height + deltaY
      }

      temp.width = temp.width < 0 ? 0 : temp.width
      temp.height = temp.height < 0 ? 0 : temp.height

      if (control) {
        control.forEach(ctrl => {
          targetObj[ctrl] = temp[ctrl]
        })
      } else {
        targetObj = {
          left: temp.left,
          top: temp.top
        }
      }
      
      const { collision, drag } = this.collisionDetect({
        left, top, width, height,
        ...targetObj,
        resize: !!control
      })
      const updatedDrag = {
        left, top, width, height,
        ...targetObj,
        ...drag
      }
      this.setData({
        startX: clientX,
        startY: clientY,
        guide: collision,
        ...updatedDrag
      })
      wx.nextTick(() => {
        this.triggerEvent('dragging', {
          drag: updatedDrag,
          guide: collision
        })
      })
    },
    onTouchEnd () {
      this.setData({
        startX: 0,
        startY: 0,
        control: null
      })
      wx.nextTick(() => {
        this.triggerEvent('dragend')
      })
    },
    collisionDetect (source) {
      const distance = this.distance.bind(this)
      const { rects } = this.data
      let collision = {
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        center: 0,
        middle: 0
      }
      let drag = {}
  
      rects.forEach(col => {
        const left = source.left
        const right = source.left + source.width
        const top = source.top
        const bottom = source.top + source.height
        const center = source.left + source.width / 2
        const middle = source.top + source.height / 2
  
        // left
        if (distance(left, col.left)) {
          drag.left = collision.left = col.left
          drag.leftConnected = true
        }
        if (distance(left, col.left + col.width)) {
          drag.left = collision.left = col.left + col.width
          drag.leftConnected = true
        }
        // top
        if (distance(top, col.top)) {
          drag.top = collision.top = col.top
          drag.topConnected = true
        }
        if (distance(top, col.top + col.height)) {
          drag.top = collision.top = col.top + col.height
          drag.topConnected = true
        }
  
        // right
        if (distance(right, (col.left + col.width))) {
          collision.right = col.left + col.width
          drag.width = collision.right - left
          drag.leftConnected = true
        }
        if (distance(right, col.left)) {
          collision.right = col.left
          drag.width = collision.right - left
          drag.leftConnected = true
        }
        // bottom
        if (distance(bottom, (col.top + col.height))) {
          collision.bottom = col.top + col.height
          drag.height = collision.bottom - top
          drag.topConnected = true
        }
        if (distance(bottom, col.top)) {
          collision.bottom = col.top
          drag.height = collision.bottom - top
          drag.topConnected = true
        }
  
        // center
        if (!source.resize && distance(center, col.left + col.width / 2)) {
          collision.center = col.left + col.width / 2
          drag.left = collision.center - source.width / 2
          drag.leftConnected = true
        }
        // middle
        if (!source.resize && distance(middle, col.top + col.height / 2)) {
          collision.middle = col.top + col.height / 2
          drag.top = collision.middle - source.height / 2
          drag.topConnected = true
        }
      })
  
      return { collision, drag }
    },
    distance(a, b) {
      return Math.abs(a - b) < this.data.gap
    }
  }
})
