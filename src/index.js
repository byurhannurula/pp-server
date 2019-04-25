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

const passportSetup = require('./config/passport')

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
})

const port = process.env.PORT || 4000
const dev = process.env.NODE_ENV !== 'production'

const RedisStore = connectRedis(session)

const startServer = async () => {
  await mongoose
    .connect(process.env.DB_URL, { useNewUrlParser: true })
    .then(() => console.log(`🔗  MongoDB Connected...`))
    .catch(err => console.log(`❌  MongoDB Connection error: ${err}`))

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
    context: ({ req, res }) => ({ req, res }),
  })

  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.use(
    cors({
      credentials: true,
      origin:
        process.env.NODE_ENV === 'production'
          ? process.env.FRONT_END_URL
          : 'http://localhost:3000',
    }),
  )

  app.use((req, _, next) => {
    const authorization = req.headers.authorization

    if (authorization) {
      try {
        const cid = authorization.split(' ')[1]
        req.headers.cookie = `cid=${cid}`
      } catch (err) {
        console.log(err)
      }
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
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        secure: false,
      },
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

      res.redirect(process.env.FRONT_END_URL)
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

      res.redirect(process.env.FRONT_END_URL)
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
