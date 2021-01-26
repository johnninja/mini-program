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
      height: 150,
      gap: 2,
      leftConnected: false,
      rightConnected: false
    },
    grid: {
      width: 20,
      span: 4,
      gutter: 20,
      padding: 20
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
    elements: [],
    showGuide: false
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
        ...this.data.page,
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
    this.setGuideLine(data)
  },
  onDragStart (e) {
    const data = e.detail
    this.setData({showGuide: true})
    this.setGuideLine(data)
  },
  onDragEnd () {
    this.setData({
      showGuide: false,
      guide: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        center: 0,
        middle: 0
      }
    })
  },
  setGuideLine (data) {
    const { collision, drag } = this.collisionDetect(data)

    this.setData({
      drag: {
        ...this.data.drag,
        ...data,
        ...drag,
        leftConnected: drag.leftConnected || false,
        topConnected: drag.topConnected || false
      },
      guide: {
        ...collision
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
    return Math.abs(a - b) < this.data.drag.gap
  }
})