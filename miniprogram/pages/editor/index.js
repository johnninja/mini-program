// miniprogram/pages/demo/index.js
const app = getApp()
const schema = {
  objectID: '',
  name: '',
  type: 'group',
  frame: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  style: {
    color: {},
    fills: {},
    borders: {},
    shadows: {},
  },
  layers: []
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mode: null,
    editorMode: 'edit',
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
      gap: 0,
      rects: []
    },
    grid: {
      width: 20,
      span: 5,
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
    groups: [],
    editingIndex: 0,
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
  handleLongPress (e) {
    const { drag, elements, grids, page, mode } = this.data
    const dataset = e.target.dataset
    const that = this

    if (mode === 'edit') {
      return
    }

    if (dataset && dataset.index >= 0) {
      this.setData({
        mode: 'edit',
        drag: {
          ...drag,
          ...elements[dataset.index]
        },
        editingIndex: dataset.index
      })
      return
    }

    wx.showActionSheet({
      itemList: ['添加元素', '删除元素', '页面属性'],
      success (res) {
        const index = res.tapIndex
        const data = that.genRect()
        const newElements = [...elements, data]

        that.setData({
          mode: 'edit',
          drag: {
            ...drag,
            ...data,
            rects: [...newElements, ...grids, page]
          },
          elements: newElements,
          editingIndex: elements.length
        })
      }
    })
  },
  onEditFinished () {
    this.setData({
      mode: null
    })
  },
  onDragging (e) {
    const { guide, drag } = e.detail
    const { editingIndex } = this.data

    const key = `elements[${editingIndex}]`
    this.setData({
      [key]: drag,
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
  },
  genRect (id) {
    const winWidth = app.globalData.winWidth
    const winHeight = app.globalData.winHeight
    const width = 100
    const height = 100

    return {
      id,
      left: (winWidth - width) / 2,
      top: (winHeight - height) / 2,
      width,
      height
    }
  }
})