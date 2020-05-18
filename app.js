const Koa = require('koa')
const app = new Koa()
const Router = require('koa-router')
const router = new Router()
const request = require('request')
const bodyParser = require('koa-bodyparser')
const config = require('./config.js')

app.use(bodyParser())

// 全局异常处理
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.body = {
      code: -1,
      data: ctx.data,
      message: ctx.msg || err.message || '服务开小差了，请稍后再试',
      etime: Date.now()
    }
  }
})

// pretty json result
app.use(async (ctx, next) => {
  await next()
  ctx.set('Content-Type', 'application/json')
  ctx.body = {
    code: ctx.code || 0,
    data: ctx.data,
    message: ctx.msg || 'success',
    etime: Date.now()
  }
})

router.get('/', async (ctx, next) => {
  ctx.data = 'api'
  await next()
})

// 根据code获取用户openid
router.post('/openid', async (ctx, next) => {
  try {
    let grant_type = 'authorization_code'
    let appid = config.appId
    let secret = config.appSecret
    let code = ctx.request.body.code
    console.log('req code: ', code)
    let opts = {
      url:
        'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' +
        appid +
        '&secret=' +
        secret +
        '&code=' +
        code +
        '&grant_type=' +
        grant_type
    }
    let res = await promiseReq(opts)
    res = JSON.parse(res)
    let openid = res.openid
    ctx.data = { openid: openid }
  } catch (e) {
    console.log(e)
  }
  await next()
})

app.use(router.routes())
app.use(router.allowedMethods())

let server = app.listen(3000, function() {
  let host = server.address().address
  let port = server.address().port
  console.log('应用实例，访问地址为 http://localhost:%s', port)
})

function promiseReq(opts = {}) {
  return new Promise((resolve, reject) => {
    request(opts, (e, r, d) => {
      if (e) {
        return reject(e)
      }
      if (r.statusCode != 200) {
        return reject(`back statusCode：${r.statusCode}`)
      }
      return resolve(d)
    })
  })
}
