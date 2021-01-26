// components/dragable/dragable.js
let timer = null
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
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    startX: 0,
    startY: 0,
    control: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    debounce(fn, time) {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(fn.bind(this), time)
    },
    onTouchStart (e) {
      const touch = e.touches[0]
      const { clientX, clientY } = touch
      const { control } = e.target.dataset

      this.setData({
        startX: clientX,
        startY: clientY,
        control: control ? control.split(',').map(item => item.trim()) : null
      })
    },
    onTouchMove (e) {
      const touch = e.changedTouches[0]
      const { clientX, clientY } = touch
      const { startX, startY, left, top, width, height, control } = this.data
      let deltaX = clientX - startX
      let deltaY = clientY - startY
      let targetObj = {}
      let widthNegtive = control && control.includes('left')
      let heightNegtive = control && control.includes('top')

      deltaX = deltaX > 0 ? Math.ceil(deltaX) : Math.floor(deltaX)
      deltaY = deltaY > 0 ? Math.ceil(deltaY) : Math.floor(deltaY)

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
          ...targetObj
        })
      })
    },
    onTouchEnd () {
      this.setData({
        startX: 0,
        startY: 0,
        control: null
      })
    }
  },
  attached () {
    
  }
})
