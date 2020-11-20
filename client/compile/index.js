const { parse, init } = require('es-module-lexer')
const MagicString = require('magic-string')
const { parse: VueParse, compileScript, compileStyle, compileTemplate } = require('@vue/compiler-sfc')


module.exports.injectUpdateStyle = function injectUpdateStyle(content) {
  const inject = `  <script>
    function updateStyle(css){
      const style = document.createElement('style')
      style.innerHTML = css
      document.head.appendChild(style)
    }
  </script>`
  return content.replace(/<\/head>/, `$&${inject}`)
}
/* 编译 css  */
module.exports.compileCss = function compileCss(content) {
  const { code } = compileStyle({ source: content, trim: true }) // 此处的 compileStyle 是可以支持 是否 scoped postcss 等的
  return code
}


/* 编译 vue template  */

module.exports.compileVueTemplate = function compileVueTemplate(content) {
  const { code } = compileTemplate({ source: content, transformAssetUrls: false });
  return compileJs(code)
}


/**
 * 编译 js 
 * import { createApp } from 'vue' 转化为 import { createApp } from '@/modules/vue' 格式
 */
function compileJs(source) {
  const [imports, exports] = parse(source, 'optional-sourcename');
  const magicString = new MagicString(source)
  const regx = /^[^\/\.@]/ // 开头不是  / . @   
  imports.forEach(({ s, e }) => {
    const str = source.substring(s, e)
    if (regx.test(str)) {
      magicString.overwrite(s, e, `/@modules/${str}`)
    }
  })
  return magicString.toString()
}
module.exports.compileJs = compileJs

/**
 * 编译 vue
 * 第一次编译 .vue 文件
 */
module.exports.compileVue = function compileVue(source, path) {
  const { descriptor } = VueParse(source)
  let { content } = compileScript(descriptor)
  content = content.replace('export default', `const __script = `)
  console.log(descriptor, 'descriptordescriptordescriptordescriptor')
  let str = ''
  if (descriptor.styles.length) {
    str = descriptor.styles.reduce((total, item, index) => {
      total += `import "${path}?type=style&index=${index}"\n`
      return total
    }, '')
  }
  let response = `${content}
          ${str}
          import {render as __render} from "${path}?type=template"
          __script.render = __render
          export default __script
        `
  return response
}

