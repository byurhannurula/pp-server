import mongoose from 'mongoose'
import { UserInputError } from 'apollo-server-express'

import * as auth from '../auth'
import { Room } from '../models'

export default {
  Query: {
    rooms: (parent, args, { req }, info) => {
      auth.checkSignedIn(req)

      return Room.find({})
    },
    room: (parent, { id }, { req }, info) => {
      auth.checkSignedIn(req)

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new UserInputError(`Room ID is not a valid Object ID!`)
      }

      return Room.findById(id)
    },
  },
  Mutation: {
    createRoom: async (parent, args, { req }, info) => {
      auth.checkSignedIn(req)

      const room = await Room.create(args)

      return room
    },
    updateRoom: async (parent, args, { req }, info) => {
      auth.checkSignedIn(req)

      // const room = await Room.findByIdAndUpdate(id)

      const room = await Room.findByIdAndUpdate(
        args.id,
        { $set: { name: args.name } },
        { new: true },
      ).catch(err => new Error(err))

      return room
    },
    deleteRoom: async (parent, { id }, { req }, info) => {
      auth.checkSignedIn(req)

      const room = await Room.findByIdAndRemove(id)

      return room
    },
  },
}
