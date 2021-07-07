//index.js
import jsnes, { Controller } from 'jsnes'
const app = getApp()
const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;
const FRAMEBUFFER_SIZE = SCREEN_WIDTH * SCREEN_HEIGHT;

Page({
  data: {
  },
  nes: null,
  context: null,
  canvas: null,
  buffer8: null,
  buffer32: null,
  onShareAppMessage: function () {
    return {
      title: 'hello'
    }
  },
  onLoad: function() {
    // let audioCtx = wx.createWebAudioContext()
    let query = wx.createSelectorQuery()
    query.select('#canvas')
      .node(res => {
        const canvas = res.node
        const ctx = canvas.getContext('2d')
        
        canvas.width = SCREEN_WIDTH
        canvas.height = SCREEN_HEIGHT

        this.canvas = canvas
        this.context = ctx
      })
      .exec()
  },
  initialNes: function(context) {
    const imageData = context.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
    let buffer = new ArrayBuffer(imageData.data.length)
    this.buffer8 = new Uint8ClampedArray(buffer)
    this.buffer32 = new Uint32Array(buffer)

    let nes = new jsnes.NES({
      onFrame: frameBuffer24 => {
        for (let i = 0; i < FRAMEBUFFER_SIZE; i++) {
          this.buffer32[i] = 0xFF000000 | frameBuffer24[i]
        }
      },
      onAudioSample: (left, right) => {

      }
    })
    this.nes = nes
  },
  pickDom: function() {
    const nes = this.nes
    console.log(nes)
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['nes'],
      success: (res) => {
        let path = res.tempFiles[0].path
        let fileManager = wx.getFileSystemManager()
        fileManager.readFile({
          filePath: path,
          encoding: 'binary',
          success: (data) => {
            console.log(nes)
            nes.loadROM(data.data)
            this.onAnimationFrame()
          },
          fail: (err) => {
            console.log(err)
          }
        })
      },
      fail: (err) => {
        console.log(err)
      }
    })
  },
  start: function() {
    const nes = this.nes
  },
  onAnimationFrame: function () {
    this.canvas.requestAnimationFrame(this.onAnimationFrame)
    const imageData = this.context.createImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
    imageData.data.set(this.buffer8)
    this.context.putImageData(imageData, 0, 0)
  }
})
