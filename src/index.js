import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import passport from 'passport'
import { createServer } from 'http'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { ApolloServer } from 'apollo-server-express'

import typeDefs from './schema'
import resolvers from './resolvers'
import * as models from './models'
import { pubsub } from './pubsub'
import passportAuth from './config/passportAuth'

require('./config/passport')

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

const port = process.env.PORT || 4000
const dev = process.env.NODE_ENV !== 'production'

const RedisStore = connectRedis(session)

const startServer = async () => {
  await mongoose
    .connect(process.env.DB_URL, { useNewUrlParser: true })
    .then(() => console.log(`🔗  MongoDB Connected!`))
    .catch(err => console.log(`❌  MongoDB error: ${err}`))

  const app = express()
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    playground: !dev
      ? false
      : {
          settings: {
            'request.credentials': 'include',
          },
        },
    context: ({ req, res }) => ({ req, res, models, pubsub }),
  })

  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.use((req, _, next) => {
    const authorization = req.headers.authorization

    if (authorization) {
      try {
        const cid = authorization.split(' ')[1]
        req.headers.cookie = `cid=${cid}`
      } catch (_) {}
    }

    return next()
  })

  app.use(
    session({
      store: new RedisStore({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        pass: process.env.REDIS_PASS,
      }),
      name: process.env.SESS_NAME,
      secret: process.env.SESS_SECRET,
      saveUninitialized: false,
      resave: false,
      cookie: {
        httpOnly: true,
        secure: !dev ? true : false,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    }),
  )

  app.use(
    cors({
      credentials: true,
      origin: !dev ? process.env.FRONTEND_URL : 'http://localhost:3000',
    }),
  )

  app.use(passport.initialize())
  passportAuth(app)

  server.applyMiddleware({ app, cors: false })

  const httpServer = createServer(app)
  server.installSubscriptionHandlers(httpServer)

  httpServer.listen({ port }, () => {
    console.log(`— Server: http://localhost:${port}${server.graphqlPath}`)
    console.log(
      `— Subscriptions: ws://localhost:${port}${server.subscriptionsPath}`,
    )
  })
}

startServer()
