import gravatar from 'gravatar'
import bcrypt from 'bcrypt'

import * as auth from '../auth'
import { User } from '../models'
import { loginSchema, registerSchema } from '../utils'

export default {
  Query: {
    users: (parent, args, { req }, info) => {
      auth.checkSignedIn(req)

      return User.find({})
    },
    user: (parent, { id }, context, info) => {
      auth.checkSignedIn(req)

      return User.findById(id)
    },
    me: (parent, args, { req }, info) => {
      auth.checkSignedIn(req)

      return User.findById(req.session.userId)
    },
  },
  Mutation: {
    signUp: async (parent, args, { req }, info) => {
      args.email = args.email.toLowerCase()

      try {
        await registerSchema.validate(args, { abortEarly: false })
      } catch (err) {
        return err
      }

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

      args.password = await bcrypt.hash(args.password, 12)
      const user = await User.create(args)

      req.session.userId = user.id

      return user
    },
    signIn: async (parent, args, { req }, info) => {
      const { email, password } = args

      try {
        await loginSchema.validate(args, { abortEarly: false })
      } catch (err) {
        return err
      }

      if (req.session.userId) {
        return User.findById(req.session.userId)
      }

      const user = await User.findOne({ email })

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Incorrect email or password. Please try again.')
      }

      req.session.userId = user.id

      return user
    },
    signOut: (parent, args, { req, res }, info) => {
      return new Promise((resolve, reject) =>
        req.session.destroy(err => {
          if (err) {
            console.log(err)
            return reject(false)
          }

          res.clearCookie(process.env.SESS_NAME)
          return resolve(true)
        }),
      )
    },
  },
}
