import mongoose from 'mongoose'
import { UserInputError } from 'apollo-server-express'

import * as auth from '../auth'
import { Room } from '../models'

export default {
  Query: {
    rooms: (parent, args, { req }, info) => {},
    room: (parent, args, { req }, info) => {},
  },
  Mutation: {
    createRoom: (parent, args, { req }, info) => {},
    updateRoom: (parent, args, { req }, info) => {},
    deleteRoom: (parent, args, { req }, info) => {},
  },
}
