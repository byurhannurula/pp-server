import { gql } from 'apollo-server-express'

import userSchema from './user'
import roomSchema from './room'
import storySchema from './story'
import voteSchema from './vote'

const baseSchema = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`

export default [baseSchema, userSchema, roomSchema, storySchema, voteSchema]
