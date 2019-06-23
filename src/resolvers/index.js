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
    getSession: async (parent, { id }, { req, models }, info) => {
      isAuthenticated(req)

      return await models.Session.findById(id)
    },
    getSessions: async (parent, {orderBy}, { req, models }, info) => {
      isAuthenticated(req)

      return await models.Session.find({}).sort({createdAt: orderBy})
    },

    // Polls
    getPoll: async (parent, { id }, { req, models }, info) => {
      isAuthenticated(req)

      return await models.Poll.findById(id)
    },
    getPolls: async (parent, args, { req, models }, info) => {
      isAuthenticated(req)

      const polls = await models.Poll.find({})

      return polls
    },

    // Votes
    getVote: async (parent, { id }, { req, models }, info) => {
      isAuthenticated(req)

      return await models.Vote.findById(id)
    },
    getVotes: async (parent, args, { req, models }, info) => {
      isAuthenticated(req)

      const votes = await models.Vote.find({})

      return votes
    },
  },
  Mutation: {
    // Users
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
    startSession: async (parent, args, { req, models }, info) => {
      isAuthenticated(req)

      const { userId } = req.session
      const { name, cardSet } = args

      const session = await models.Session.create({
        name: name,
        cardSet: cardSet,
        createdBy: userId,
        members: userId,
      })

      await models.User.updateMany(
        { _id: { $in: userId } },
        { $push: { sessions: session } },
      )

      return session
    },
    updateSession: async (parent, args, { req, models }, info) => {
      isAuthenticated(req)

      const { sessionId, name, cardSet } = args

      const session = await models.Session.findById(sessionId)

      if (!session) return null

      const updatedSession = await models.Session.findOneAndUpdate(
        { _id: sessionId },
        {
          name: name,
          cardSet: cardSet,
          updatedAt: Date(),
        },
      )

      return updatedSession
    },
    deleteSession: async (parent, { sessionId }, { req, models }, info) => {
      isAuthenticated(req)

      const session = await models.Session.findById(sessionId)

      if (!session)
        return { message: `Session with id ${sessionId} is not found!` }

      await models.Session.findOneAndRemove({ _id: sessionId })

      return { message: 'Session deleted successfully!' }
    },

    // Polls
    addPoll: async (parent, args, { req, models }, info) => {
      isAuthenticated(req)

      const poll = await models.Poll.create(args)

      await models.Session.updateOne(
        { _id: args.session },
        { $push: { polls: poll } },
      )

      return poll
    },
    deletePoll: async (parent, { pollId }, { req, models }, info) => {
      isAuthenticated(req)

      const poll = await models.Poll.findById(pollId)

      if (!poll) return { message: `Poll with id ${pollId} is not found!` }

      await models.Poll.findOneAndDelete({ _id: pollId })

      return { message: 'Poll deleted successfully!' }
    },

    // Adding Members
    inviteMember: async (parent, args, { req, models }, info) => {
      isAuthenticated(req)

      const { sessionId, email } = args

      const user = await models.User.findOne({ email })
      const session = await models.Session.findById(sessionId)

      if (!session) {
        return { message: `Session with '${sessionId}' is not found!` }
      }
      if (!user) {
        return { message: `User with '${email}' is not found!` }
      }
      if (session.members.indexOf(user._id) !== -1) {
        return { message: `User is already added!` }
      }

      await models.User.updateOne(
        { _id: user._id },
        { $push: { sessions: sessionId } },
      )

      await models.Session.findOneAndUpdate(
        { _id: sessionId },
        { $push: { members: user.id } },
      )

      return { message: 'User invited successfully!' }
    },
    deleteMember: async (parent, args, { req, models }, info) => {
      isAuthenticated(req)

      const { sessionId, userId } = args

      const user = await models.User.findById(userId)
      const session = await models.Session.findById(sessionId)

      if (!session) {
        return { message: `Session with '${sessionId}' is not found!` }
      }
      if (!user) {
        return { message: `User with '${userUd}' is not found!` }
      }

      await models.User.findOneAndUpdate(
        { _id: userId },
        { $pull: { sessions: sessionId } },
      )

      await models.Session.findOneAndUpdate(
        { _id: sessionId },
        { $pull: { members: userId } },
      )

      return { message: 'Member deleted successfully!' }
    },

    // Votes
    addVote: async (parent, args, { req, models }, info) => {
      isAuthenticated(req)

      // Check is user/poll id valid
      const { pollId, userId, value } = args

      const poll = await models.Poll.findById(pollId)
      const user = await models.User.findById(userId)

      if (!poll) return null
      if (!user) return null

      // Create vote
      const vote = await models.Vote.create({
        poll: pollId,
        user: userId,
        value: value,
      })

      // Add new vote to poll
      await models.Poll.findOneAndUpdate(
        { _id: pollId },
        { $push: { votes: vote } },
      )

      return vote
    },
    deleteVote: async (parent, { voteId }, { req, models }, info) => {
      isAuthenticated(req)

      const vote = await models.Vote.findById(voteId)

      if (!vote) return { message: `Vote with id ${voteId} is not found!` }

      await models.Vote.findOneAndDelete({ _id: voteId })

      return { message: 'Vote deleted successfully!' }
    },
  },
  User: {
    sessions: async (user, args, { req }, info) => {
      // TODO: should not be able to list other ppl's sessions/polls/votes..!
      return (await user.populate('sessions').execPopulate()).sessions
    },
  },
  Session: {
    createdBy: async (session, args, { req }, info) => {
      return (await session.populate('createdBy').execPopulate()).createdBy
    },
    members: async (session, args, { req }, info) => {
      return (await session.populate('members').execPopulate()).members
    },
    polls: async (session, args, { req }, info) => {
      return (await session.populate('polls').execPopulate()).polls
    },
  },
  Poll: {
    session: async (poll, args, { req }, info) => {
      return (await poll.populate('session').execPopulate()).session
    },
    votes: async (poll, args, { req }, info) => {
      return (await poll.populate('votes').execPopulate()).votes
    },
  },
  Vote: {
    poll: async (vote, args, { req }, info) => {
      return (await vote.populate('poll').execPopulate()).poll
    },
    user: async (vote, args, { req }, info) => {
      return (await vote.populate('user').execPopulate()).user
    },
  },
}
