import Joi from 'joi'
import mongoose from 'mongoose'
import { UserInputError } from 'apollo-server-express'

import { User } from '../models'
import { registerSchema } from '../utils'

export default {
  Query: {
    users: (parent, args, context, info) => {
      // TODO: auth

      return User.find({})
    },
    user: (parent, { id }, context, info) => {
      // TODO: auth

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new UserInputError(`${id} is not a valid user ID!`)
      }

      return User.findById(id)
    },
  },
  Mutation: {
    register: async (parent, args, context, info) => {
      // TODO: auth

      // validation
      await Joi.validate(args, registerSchema, {
        abortEarly: false,
      })
      return User.create(args)
    },
  },
}
