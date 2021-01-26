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
    leftConnected: {
      type: Boolean,
      value: false
    },
    topConnected: {
      type: Boolean,
      value: false
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
    topConnectedStatus: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTouchStart (e) {
      const { left, top, width, height } = this.data
      const touch = e.touches[0]
      const { clientX, clientY } = touch
      const { control } = e.target.dataset

      this.setData({
        startX: clientX,
        startY: clientY,
        control: control ? control.split(',').map(item => item.trim()) : null
      })
      wx.nextTick(() => {
        this.triggerEvent('dragstart', { left, top, width, height })
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

      if (leftConnected && Math.abs(deltaX) < gap) {
        deltaX = 0
      }
      if (topConnected && Math.abs(deltaY) < gap) {
        deltaY = 0
      }

      const temp = {
        left: left + deltaX,
        top: top + deltaY,
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
      
      this.setData({
        startX: clientX,
        startY: clientY,
        ...targetObj
      })
      wx.nextTick(() => {
        this.triggerEvent('dragging', {
          left, top, width, height,
          ...targetObj,
          resize: !!control
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
    }
  },
  attached () {
    
  }
})
