import mongoose from 'mongoose'
import { UserInputError } from 'apollo-server-express'

import * as auth from '../auth'
import { Story } from '../models'

export default {
  Query: {
    votes: (parent, args, { req }, info) => {},
    vote: (parent, args, { req }, info) => {},
  },
  Mutation: {
    vote: (parent, args, { req }, info) => {},
  },
}
