// 云函数入口文件
const cloud = require('wx-server-sdk')
const fs = require('fs')
const path = require('path')
const { Readable, Writable } = require('stream')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
// const output = fs.createWriteStream('test.mp4')

ffmpeg.setFfmpegPath(ffmpegPath)

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => new Promise((resolve, reject) => {
  const stream = new Readable()
  stream.push(event.file, 'hex')
  stream.push(null)

  const output = new Writable()

  const command = ffmpeg()

  command
    .input(stream)
    .inputFormat('gif')
    .output(output)
    .on('codecdata', function(data) {
      console.log(data.video)
    })
    .on('stderr', stderrLine => {
      console.log('Stderr output: ' + stderrLine)
      reject(stderrLine)
    })
    .on('end', function () {
      resolve('output')
      console.log('成功')
    })
    .on('error', function (err) {
      reject(err)
      console.log('失败')
    })
    .run()
})