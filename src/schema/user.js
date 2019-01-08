import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    user(id: ID!): User
    users: [User!]!
  }

  extend type Mutation {
    register(
      name: String!
      email: String!
      username: String!
      password: String!
    ): User
    login(username: String!, password: String!): User!
    logout(id: ID!): User!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    username: String!
    password: String!
  }
`
