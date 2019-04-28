import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import passport from 'passport'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { ApolloServer } from 'apollo-server-express'

import typeDefs from './schema'
import resolvers from './resolvers'
import * as models from './models'

require('./config/passport')

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
})

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
            // 'editor.theme': 'light',
          },
        },
    context: ({ req, res }) => ({ req, res, models }),
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

  app.get('/auth/github', passport.authenticate('github', { session: false }))

  app.get(
    '/auth/github/redirect',
    passport.authenticate('github', {
      session: false,
      failureRedirect: '/login',
    }),
    (req, res) => {
      if (req.user.user.id && req.session) {
        req.session.userId = req.user.user.id
        req.session.accessToken = req.user.accessToken
        req.session.refreshToken = req.user.refreshToken
      }

      res.redirect(process.env.FRONTEND_URL)
    },
  )

  app.get(
    '/auth/google',
    passport.authenticate('google', {
      session: false,
      scope: ['profile', 'email'],
    }),
  )

  app.get(
    '/auth/google/redirect',
    passport.authenticate('google', {
      session: false,
      failureRedirect: '/login',
    }),
    (req, res) => {
      if (req.user.user.id && req.session) {
        req.session.userId = req.user.user.id
        req.session.accessToken = req.user.accessToken
        req.session.refreshToken = req.user.refreshToken
      }

      res.redirect(process.env.FRONTEND_URL)
    },
  )

  server.applyMiddleware({ app, cors: false })

  app.listen({ port }, () =>
    console.log(
      `🚀  Server ready at http://localhost:${port}${server.graphqlPath}`,
    ),
  )
}

startServer()
