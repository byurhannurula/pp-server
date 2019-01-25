import { gql } from 'apollo-server-express'

const schema = gql`
  type Query {
    me: User
    user(id: ID!): User
    users: [User!]!

    room(id: ID!): Room
    rooms: [Room!]!

    story(id: ID!): Story
    stories: [Story!]!

    vote(id: ID!): User
    votes: [Vote!]!
  }

  type Mutation {
    signUp(name: String!, email: String!, password: String!): User
    signIn(email: String!, password: String!): User!
    signOut: Boolean

    createRoom(name: String!, cardValues: String!): Room!
    updateRoom(id: ID!, name: String!, cardValues: String): Room!
    deleteRoom(id: ID!): Room

    createStory(topic: String!): Story
    updateStory(id: ID!): Story
    deleteStory(id: ID!): Story

    vote: Vote
  }

  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    avatar: String
    createdRooms: [Room!]
    createdAt: String!
    updatedAt: String!
  }

  type Room {
    id: ID!
    name: String!
    cardValues: String!
    createdBy: User!
    users: [User]
    date: String!
    createdAt: String!
    updatedAt: String!
  }

  type Story {
    id: ID!
    topic: String!
    creator: User!
    startTime: Int
    endTime: Int
    result: Int
  }

  type Vote {
    id: ID!
    value: String!
  }
`

export default schema
