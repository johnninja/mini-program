// miniprogram/pages/demo/index.js
const app = getApp()
let timer = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: {
      left: 0,
      top: 0,
      width: 0,
      height: 0
    },
    drag: {
      left: 0,
      top: 0,
      width: 200,
      height: 150
    },
    grid: {
      width: 10,
      span: 4,
      gutter: 20,
      padding: 40
    },
    guide: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      center: 0,
      middle: 0
    },
    grids: [],
    elements: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const drag = this.data.drag
    const width = app.globalData.winWidth
    const height = app.globalData.winHeight
    this.setData({
      page: {
        width,
        height
      },
      drag: {
        ...drag,
        left: (width - drag.width) / 2,
        top: (height - drag.height) / 2
      }
    })
  },

  onDragging (e) {
    const data = e.detail
    const { collision, drag } = this.collisionDetect(data)

    this.setData({
      drag: {
        ...data,
        ...drag
      },
      guide: {
        ...collision
      }
    })

    wx.nextTick(() => {
      if (
        collision.left !== 0 ||
        collision.right !== 0 ||
        collision.top !== 0 ||
        collision.bottom !== 0 ||
        collision.center !== 0 ||
        collision.middle !== 0
      ) {
        wx.vibrateShort()
      }
    })
  },
  onGridLoaded (e) {
    const data = e.detail
    this.setData({
      grids: data
    })
  },
  collisionDetect (source) {
    const distance = this.distance
    const { elements, grids, page } = this.data
    let mixEles = [...elements, ...grids, page]

    let collision = {
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
      center: 0,
      middle: 0
    }
    let drag = {}

    mixEles.forEach(col => {
      const left = source.left
      const right = source.left + source.width
      const top = source.top
      const bottom = source.top + source.height
      const center = source.left + source.width / 2
      const middle = source.top + source.height / 2

      // left
      if (distance(left, col.left)) {
        drag.left = collision.left = col.left
      }
      if (distance(left, col.left + col.width)) {
        drag.left = collision.left = col.left + col.width
      }
      // top
      if (distance(top, col.top)) {
        drag.top = collision.top = col.top
      }
      if (distance(top, col.top + col.height)) {
        drag.top = collision.top = col.top + col.height
      }

      // right
      if (distance(right, (col.left + col.width))) {
        collision.right = col.left + col.width
        drag.width = collision.right - left
      }
      if (distance(right, col.left)) {
        collision.right = col.left
        drag.width = collision.right - left
      }
      // bottom
      if (distance(bottom, (col.top + col.height))) {
        collision.bottom = col.top + col.height
        drag.height = collision.bottom - top
      }
      if (distance(bottom, col.top)) {
        collision.bottom = col.top
        drag.height = collision.bottom - top
      }

      // center
      if (distance(center, col.left + col.width / 2)) {
        collision.center = col.left + col.width / 2
        drag.left = collision.center - source.width / 2
      }
      // middle
      if (distance(middle, col.top + col.height / 2)) {
        collision.middle = col.top + col.height / 2
        drag.top = collision.middle - source.height / 2
      }
    })

    return { collision, drag }
  },
  distance(a, b) {
    return Math.abs(a - b) < 3
  },
  debounce(fn, time) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(fn.bind(this), time)
  }
})