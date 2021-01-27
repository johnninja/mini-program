// miniprogram/pages/demo/index.js
const app = getApp()
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
      rects: []
    },
    grid: {
      width: 0,
      span: 0,
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
    const { page, drag, grids, elements } = this.data
    const width = app.globalData.winWidth
    const height = app.globalData.winHeight
    const pageData = {
      ...page,
      width,
      height
    }
    this.setData({
      page: pageData,
      drag: {
        ...drag,
        rects: [
          ...grids,
          ...elements,
          pageData
        ],
        left: (width - drag.width) / 2,
        top: (height - drag.height) / 2
      }
    })
  },

  onDragging (e) {
    const { guide } = e.detail
    this.setData({
      guide
    })
  },
  onDragStart (e) {
    const { guide } = e.detail
    this.setData({
      showGuide: true,
      guide
    })
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
  onGridLoaded (e) {
    const data = e.detail
    const { page, elements, grids } = this.data
    this.setData({
      grids: data,
      'drag.rects': [
        ...elements,
        ...grids,
        page
      ]
    })
  }
})