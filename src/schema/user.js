import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    user(id: ID!): User
    users: [User!]!
    me: User
  }

  extend type Mutation {
    signUp(
      name: String!
      email: String!
      username: String!
      password: String!
    ): User
    signIn(username: String!, password: String!): User!
    signOut: Boolean
  }

  type User {
    id: ID!
    name: String!
    email: String!
    username: String!
    password: String!
  }
`
