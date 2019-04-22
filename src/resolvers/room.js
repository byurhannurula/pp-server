import * as auth from '../auth'
import { Room, User } from '../models'

export default {
  Query: {
    rooms: (parent, args, { req }, info) => {
      auth.checkSignedIn(req)

      return Room.find({})
    },
    room: (parent, { id }, { req }, info) => {
      auth.checkSignedIn(req)

      return Room.findById(id)
    },
  },
  Mutation: {
    startRoom: async (parent, args, { req }, info) => {
      auth.checkSignedIn(req)

      const room = await Room.create(args)
      
      User.createdRooms.push(args.id)

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
