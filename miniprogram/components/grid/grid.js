// components/grid/grid.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    span: {
      type: Number,
      value: 0
    },
    gutter: {
      type: Number,
      value: 0
    },
    padding: {
      type: Number,
      value: 0
    },
    width: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    columns: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    caculate (width) {
      const { span, gutter, padding } = this.data
      let arr = []
      let w = (width - padding * 2 - gutter * (span - 1)) / span

      for (let i = 0; i < span; i++) {
        let temp = {
          left: i * (w + gutter) + padding,
          width: w
        }
        arr.push(temp)
      }

      return arr
    }
  },
  attached () {
    const width = app.globalData.winWidth
    const height = app.globalData.winHeight
    const columns = this.caculate(width)

    this.setData({ columns })
    this.triggerEvent('loaded', columns)
  }
})
