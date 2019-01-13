import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    story(id: ID!): Story
    stories: [Story!]!
  }

  extend type Mutation {
    createStory(topic: String!): Story
    updateStory(id: ID!): Story
    deleteStory(id: ID!): Story
  }

  type Story {
    id: ID!
    topic: String!
    creator: User!
    startTime: Int
    endTime: Int
    result: Int
  }
`
