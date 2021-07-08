//index.js
import jsnes, {
  Controller
} from 'jsnes'
import { initGl, render } from './render'

const app = getApp()
const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;
const FRAMEBUFFER_SIZE = SCREEN_WIDTH * SCREEN_HEIGHT;

const AUDIO_BUFFERING = 512
const SAMPLE_COUNT = 4 * 1024
const SAMPLE_MASK = SAMPLE_COUNT - 1
Page({
  data: {},
  nes: null,
  gl: null,
  canvas: null,
  buffer8: null,
  buffer32: null,
  audioL: new Float32Array(SAMPLE_COUNT),
  audioR: new Float32Array(SAMPLE_COUNT),
  audioReadCursor: 0,
  audioWriteCursor: 0,
  onLoad: function () {
    let query = wx.createSelectorQuery()
    query.select('#canvas')
      .node(res => {
        const canvas = res.node
        const gl = canvas.getContext('webgl')

        canvas.width = SCREEN_WIDTH
        canvas.height = SCREEN_HEIGHT
        
        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)

        this.canvas = canvas
        this.gl = gl
        initGl(gl)
        this.initialNes()
      })
      .exec()
  },
  initialNes: function () {
    let buffer = new ArrayBuffer(SCREEN_WIDTH * SCREEN_HEIGHT * 4)
    this.buffer8 = new Uint8Array(buffer)
    this.buffer32 = new Uint32Array(buffer)

    let nes = new jsnes.NES({
      onFrame: frameBuffer24 => {
        for (let i = 0; i < FRAMEBUFFER_SIZE; i++) {
          this.buffer32[i] = 0xFF000000 | frameBuffer24[i]
        }
      },
      onAudioSample: (left, right) => {
        this.audioL[this.audioWriteCursor] = left
        this.audioR[this.audioWriteCursor] = right
        this.audioWriteCursor = (this.audioWriteCursor + 1) & SAMPLE_MASK
      }
    })
    this.nes = nes

    if (wx.canIUse('createWebAudioContext')) {
      let audioCtx = wx.createWebAudioContext()

      let scriptProcessor = audioCtx.createScriptProcessor(AUDIO_BUFFERING, 0, 2)
      scriptProcessor.onaudioprocess = this.onAudioProcess
      scriptProcessor.connect(audioCtx.destination)
    }

  },
  pickDom: function () {
    const nes = this.nes
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
            nes.loadROM(data.data)
            this.onAnimationFrame.call(this)
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
  onAudioProcess: function (e) {
    const nes = this.nes
    let dst = e.outputBuffer
    let len = dst.length
    const audioReadCursor = this.audioReadCursor
    const audioWriteCursor = this.audioWriteCursor

    if ((audioWriteCursor - audioReadCursor) & SAMPLE_MASK < AUDIO_BUFFERING) {
      nes.frame()
    }

    let dst_l = dst.getChannelData(0)
    let dst_r = dst.getChannelData(1)

    for (let i = 0; i < len; i++) {
      let srcIdx = (audioReadCursor + i) & SAMPLE_MASK
      dst_l[i] = this.audioL[srcIdx]
      dst_r[i] = this.audioR[srcIdx]
    }

    this.audioReadCursor = (audioWriteCursor + len) & SAMPLE_MASK
  },
  onAnimationFrame: function () {
    const gl = this.gl
    const canvas = this.canvas
    canvas.requestAnimationFrame(this.onAnimationFrame)

    render(gl, this.buffer8)
    this.nes.frame()
  },
  touchStart: function (e) {
    const nes = this.nes
    const {
      name
    } = e.target.dataset
    nes.buttonDown(1, Controller[name])
  },
  touchEnd: function (e) {
    const nes = this.nes
    const {
      name
    } = e.target.dataset
    nes.buttonUp(1, Controller[name])
  }
})