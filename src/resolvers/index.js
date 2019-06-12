import gravatar from 'gravatar'
import bcrypt from 'bcrypt'

import { isAuthenticated, signOut } from '../utils/auth'
import { loginSchema, registerSchema, pollSchema } from '../utils'

export default {
  Query: {
    // Users
    me: (parent, args, { req, models }, info) => {
      isAuthenticated(req)

      return models.User.findById(req.session.userId)
    },
    getUser: (parent, { id }, { req, models }, info) => {
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

      const sessions = await models.Session.find({}).sort({ createdAt: 'desc' })
      return sessions
    },

    // Polls
    getPoll: (parent, { id }, { req, models }, info) => {
      isAuthenticated(req)

      return models.Poll.findById(id)
    },
    getPolls: async (parent, args, { req, models }, info) => {
      isAuthenticated(req)

      const polls = await models.Poll.find({})

      return polls
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
    updateUser: async (parent, args, { req, models }, info) => {
      isAuthenticated(req)

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

      const updatedUser = await models.User.findOneAndUpdate(
        { _id: args.id },
        {
          name: args.name,
          bio: args.bio,
          email: args.email,
          avatar: args.avatar,
          password: args.password,
          updatedAt: Date(),
        },
      )

      return updatedUser
    },

    // Sessions
    startSession: async (
      parent,
      { name, cardSet, polls },
      { req, models },
      info,
    ) => {
      isAuthenticated(req)
      const { userId } = req.session

      const session = await models.Session.create({
        name,
        cardSet,
        createdBy: userId,
        members: userId,
      })

      await models.User.updateMany(
        { _id: { $in: userId } },
        {
          $push: { sessions: session },
        },
      )

      return session
    },
    updateSession: async (parent, args, { req, models }, info) => {
      isAuthenticated(req)

      const updatedSession = await models.Session.findOneAndUpdate(
        { _id: args.id },
        {
          name: args.name,
          cardSet: args.cardSet,
          updatedAt: Date(),
        },
      )

      return updatedSession
    },
    deleteSession: async (parent, args, { req, models }, info) => {
      isAuthenticated(req)

      await models.Session.findOneAndRemove({ _id: args.id })

      return { message: 'Session deleted successfully!' }
    },

    // Polls
    addPoll: async (parent, args, { req, models }, info) => {
      // const isOwner = req.session.userId ===

      try {
        await pollSchema.validate(args, { abortEarly: false })
      } catch (err) {
        return err
      }

      const poll = await models.Poll.create(args)

      const { sessionId } = args

      await models.Session.updateOne(
        { _id: sessionId },
        { $push: { polls: poll } },
      )

      return poll
    },
    deletePoll: async (parent, args, { req, models }, info) => {
      isAuthenticated(req)

      await models.Poll.findOneAndDelete({ _id: args.id })

      return { message: 'Poll deleted successfully!' }
    },

    inviteMember: async (
      parent,
      { sessionId, email },
      { req, models },
      info,
    ) => {
      isAuthenticated(req)

      const user = await models.User.findOne({ email })

      if (!user) return { message: `User with '${email}' email is not found!` }

      await models.User.updateOne(
        { _id: user.id },
        {
          $push: { sessions: sessionId },
        },
      )

      await models.Session.findOneAndUpdate(
        { _id: sessionId },
        {
          $push: { members: user.id },
        },
      )

      return { message: 'User invited successfully!' }
    },
    deleteMember: async (
      parent,
      { sessionId, email },
      { req, models },
      info,
    ) => {
      isAuthenticated(req)

      const user = await models.User.findOne({ email })

      if (!user) return { message: `User with '${email}' email is not found!` }

      await models.User.findOneAndUpdate(
        { _id: user.id },
        {
          $pull: { sessions: sessionId },
        },
      )

      await models.Session.findOneAndUpdate(
        { _id: sessionId },
        {
          $pull: { members: user.id },
        },
      )

      return { message: 'Member deleted successfully!' }
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
    polls: async (session, args, { req }, info) => {
      // TODO: should not be able to list other ppl's sessions..!
      return (await session.populate('polls').execPopulate()).polls
    },
  },
}
