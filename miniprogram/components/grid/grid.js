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
    width: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    columns: [],
    grids: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    caculate (width) {
      const { span, gutter } = this.data
      let arr = []
      let w = (width - (gutter * (span + 1))) / span
      for (let i = 0; i < span; i++) {
        let temp = {
          left: (w * i) + (gutter * (i + 1)),
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
  }
})
