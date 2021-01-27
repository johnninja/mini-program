// components/toolbar/toolbar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    message: {
      type: Object,
      value: {
        top: {
          type: Number,
          value: 0
        },
        left: {
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
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleFinish () {
      this.triggerEvent('finished')
    }
  }
})
