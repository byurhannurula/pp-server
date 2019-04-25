require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })
import passport from 'passport'
const GithubStrategy = require('passport-github').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy

import { User } from '../models'

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ githubId: profile.id })

      if (user) {
        return done(null, { user, accessToken, refreshToken })
      } else {
        user = await User.create({
          githubId: profile.id,
          name: profile._json.name,
          email: profile._json.email,
          avatar: profile._json.avatar_url,
        })
      }

      done(null, {
        user,
        accessToken,
        refreshToken,
      })
    },
  ),
)

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ googleId: profile.id })

      if (user) {
        return done(null, { user, accessToken, refreshToken })
      } else {
        user = await User.create({
          googleId: profile._json.sub,
          name: profile._json.name,
          email: profile._json.email,
          avatar: profile._json.picture,
        })
      }

      done(null, {
        user,
        accessToken,
        refreshToken,
      })
    },
  ),
)
