import mongoose from 'mongoose'
import { UserInputError } from 'apollo-server-express'

import * as auth from '../auth'
import { Story } from '../models'

export default {
  Query: {
    stories: (parent, args, { req }, info) => {},
    story: (parent, args, { req }, info) => {},
  },
  Mutation: {
    createStory: (parent, args, { req }, info) => {},
    updateStory: (parent, args, { req }, info) => {},
    deleteStory: (parent, args, { req }, info) => {},
  },
}
