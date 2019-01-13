import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    vote(id: ID!): User
    votes: [Vote!]!
  }

  extend type Mutation {
    vote(): Vote
  }

  type Vote {
    id: ID!
    value: String!
  }
`
