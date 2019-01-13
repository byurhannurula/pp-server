import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    room(id: ID!): Room
    rooms: [Room!]!
  }

  extend type Mutation {
    createRoom(name: String!): Room!
    updateRoom(id: ID!): Room!
    deleteRoom(id: ID!): Room
  }

  type Room {
    id: ID!
    name: String!
  }
`
