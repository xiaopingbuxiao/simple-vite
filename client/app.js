const Koa = require('koa')
const koaLogger = require('koa-logger')
const path = require('path')
const koaStatic = require('koa-static')
const fs = require('fs')
const { Readable } = require('stream')
const { injectUpdateStyle, compileCss, compileVueTemplate, compileJs, compileVue } = require('./compile')
const { parse: VueParse } = require('@vue/compiler-sfc')


const app = new Koa();
// logger
app.use(koaLogger())
// 根路径
global.$rootPath = path.resolve(__dirname, '../')



app.use(async (ctx, next) => {
  await next();
  const filePath = path.join(global.$rootPath, ctx.path)

  /* 如果是返回的html 则注入js 的处理 */
  if (ctx.response.is('html')) {
    let str = fs.readFileSync(filePath, 'utf-8')
    ctx.body = injectUpdateStyle(str)
  }
  /* 如果是返回css 相当于jsonp 返回 */
  if (ctx.response.is('css')) {
    const data = fs.readFileSync(filePath, 'utf-8').replace(/\n/g, '')
    ctx.type = 'js'
    ctx.body = `updateStyle('${compileCss(data)}')`
  }

  /* 如果是js */
  if (ctx.response.is('js')) {
    if (ctx.body instanceof Readable) {  // 如果读取到 /@modules/ 时已经做了处理 不再是流
      const source = fs.readFileSync(filePath, 'utf-8')
      ctx.body = compileJs(source)
    }
  }
  /* 如果是 vue 文件 */
  if (ctx.path.endsWith('.vue')) {
    const source = fs.readFileSync(filePath, 'utf-8')
    const { descriptor } = VueParse(source)
    if (!ctx.query.type) {
      ctx.type = 'js'
      ctx.body = compileVue(source, ctx.path)
    } else if (ctx.query.type === 'template') {
      ctx.type = 'js';
      ctx.body = compileVueTemplate(descriptor.template.content)
    } else if (ctx.query.type === 'style') {
      const index = ctx.query.index
      const code = compileCss(descriptor.styles[index].content)
      ctx.body = `updateStyle(${JSON.stringify(code)})`
      ctx.type = 'js'
    }
  }
})



/* 加载 vue.js */
app.use(async (ctx, next) => {
  await next()
  if (ctx.path.startsWith('/@modules/vue')) {
    const vuePath = path.join(global.$rootPath, 'node_modules/vue/dist/vue.runtime.esm-browser.prod.js')
    ctx.type = 'js'
    const data = fs.readFileSync(vuePath, 'utf-8')
    ctx.body = data
  }
})


// 静态资源
app.use(koaStatic(global.$rootPath))
app.use(koaStatic(path.join(global.$rootPath, './src')))





module.exports = app











