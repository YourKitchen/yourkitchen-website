import express from 'express'
import path from 'path'
import { botUserAgents, makeMiddleware } from 'rendertron-middleware'
import expressStaticGzip from 'express-static-gzip'
import compression from 'compression'

const buildDir = path.join(process.cwd(), 'build')

const app = express()

const bots = botUserAgents.concat(['googlebot', 'yolobot'])

app.use(
  makeMiddleware({
    userAgentPattern: new RegExp(bots.join('|'), 'i'),
    proxyUrl: 'https://rendertron.yourkitchen.io/render',
  }),
)

// Load static and cache for 24 hours
app.use(
  expressStaticGzip(buildDir, {
    enableBrotli: true,
    serveStatic: {
      maxAge: process.env.NODE_ENV === 'production' ? 2592000 : 0,
    },
  }),
)
app.use(compression())

app.use('/*', (_req, res) => {
  res.sendFile(path.join(buildDir, 'index.html'))
})

app.listen(3000, () => {
  console.log(
    'Started render manager at http://localhost:3000 from: ' + buildDir,
  )
})
