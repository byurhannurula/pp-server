import gravatar from 'gravatar'
import bcrypt from 'bcrypt'

import { isAuthenticated, signOut } from '../utils/auth'
import { loginSchema, registerSchema } from '../utils'

export default {
  Query: {
    // Users
    me: (parent, args, { req, models }, info) => {
      isAuthenticated(req)

      return models.User.findById(req.session.userId)
    },
    getUser: (parent, { id }, { models }, info) => {
      isAuthenticated(req)

      return models.User.findById(id)
    },
    getUsers: async (parent, args, { req, models }, info) => {
      isAuthenticated(req)

      return await models.User.find({})
    },

    // Sessions
    getSession: (parent, { id }, { req, models }, info) => {
      isAuthenticated(req)

      return models.Session.findById(id)
    },
    getSessions: async (parent, args, { req, models }, info) => {
      isAuthenticated(req)

      const sessions = await models.Session.find({}).sort({createdAt: 'desc'})
      return sessions
    },
  },
  Mutation: {
    signUp: async (parent, args, { req, models }, info) => {
      args.email = args.email.toLowerCase()

      try {
        await registerSchema.validate(args, { abortEarly: false })
      } catch (err) {
        return err
      }
      const { email } = args
      const userExists = await models.User.findOne({ email })

      if (userExists) {
        throw new Error('Email already exists!')
      }

      args.avatar = await gravatar.url(
        args.email,
        {
          protocol: 'https',
          s: '200', // Size
          r: 'pg', // Rating
          d: 'identicon',
        },
        true,
      )

      args.password = await bcrypt.hash(args.password, 12)

      const user = await models.User.create(args)

      req.session.userId = user.id

      return user
    },
    signIn: async (parent, args, { req, models }, info) => {
      const { email, password } = args

      try {
        await loginSchema.validate(args, { abortEarly: false })
      } catch (err) {
        return err
      }

      const user = await models.User.findOne({ email })

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Incorrect email or password. Please try again.')
      }

      req.session.userId = user.id

      return user
    },
    signOut: (parent, args, { req, res }, info) => {
      return signOut(req, res)
    },

    // Sessions
    startSession: async (parent, { name, cardSet }, { req, models }, info) => {
      isAuthenticated(req)
      const { userId } = req.session

      const session = await models.Session.create({
        name,
        cardSet,
        createdBy: userId,
      })

      await models.User.updateMany(
        { _id: { $in: userId } },
        {
          $push: { sessions: session },
        },
      )

      return session
    },
  },
  User: {
    sessions: async (user, args, { req }, info) => {
      // TODO: should not be able to list other ppl's sessions..!
      return (await user.populate('sessions').execPopulate()).sessions
    },
  },
  Session: {
    createdBy: async (session, args, { req }, info) => {
      // TODO: should not be able to list other ppl's sessions..!
      return (await session.populate('createdBy').execPopulate()).createdBy
    },
    members: async (session, args, { req }, info) => {
      // TODO: should not be able to list other ppl's sessions..!
      return (await session.populate('members').execPopulate()).members
    },
  },
}
