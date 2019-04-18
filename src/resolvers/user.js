import Joi from 'joi'
import mongoose from 'mongoose'
import gravatar from 'gravatar'
import { UserInputError } from 'apollo-server-express'

import * as auth from '../auth'
import { User } from '../models'
import { loginSchema, registerSchema } from '../utils'

export default {
  Query: {
    users: (parent, args, { req }, info) => {
      // auth.checkSignedIn(req)

      return User.find({})
    },
    user: (parent, { id }, context, info) => {
      // auth.checkSignedIn(req)

      // if (!mongoose.Types.ObjectId.isValid(id)) {
      //   throw new UserInputError(`User ID is not a valid Object ID!`)
      // }

      return User.findById(id)
    },
    me: (parent, args, { req }, info) => {
      // auth.checkSignedIn(req)

      return User.findById(req.session.userId)
    },
  },
  Mutation: {
    signUp: async (parent, args, { req }, info) => {
      // auth.checkSignedOut(req)

      // // validation
      // await Joi.validate(args, registerSchema, {
      //   abortEarly: false,
      // })

      args.avatar = await gravatar.url(
        args.email,
        {
          protocol: 'https',
          s: '200', // Size
          r: 'pg', // Rating
          d: 'mm', // Default
        },
        true,
      )

      // if validation is true create user with args
      const user = await User.create(args)
      // set user id to session.userId
      req.session.userId = user.id

      return user
    },
    signIn: async (parent, {email, password}, { req }, info) => {
      // validation
      // await Joi.validate(args, loginSchema, {
      //   abortEarly: false,
      // })

      // if (req.session.userId) {
      //   return User.findById(req.session.userId)
      // }

      const user = await User.findOne( { email: email } )
      
      if (!user) {
        return null;
      }


      if (!(await user.matchesPassword(password))) {
        return null;
      }

      // const user = await auth.attemptSignIn(args.email, args.password)

      req.session.userId = user.id

      return user
    },
    signOut: (parent, args, { req, res }, info) => {
      // auth.checkSignedIn(req)

      return new Promise((resolve, reject) => {
        req.session.destroy(err => {
          if (err) {
            console.log(err)
            return reject(false)
          }
    
          res.clearCookie(process.env.SESS_NAME)
          return resolve(true)
        })
      })
    },
  },
}
