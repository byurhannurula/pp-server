import { gql } from 'apollo-server-express'

const schema = gql`
  type Query {
    me: User
    getUser(id: ID!): User
    getUsers: [User!]

    getSession(id: ID!): Session
    getSessions: [Session!]

    getPoll(id: ID!): Poll
    getPolls: [Poll]

    getVote(id: ID!): Vote
    getVotes: [Vote!]
  }

  type Mutation {
    signUp(name: String!, email: String!, password: String!): User
    signIn(email: String!, password: String!): User!
    signOut: Boolean
    updateUser(
      id: String!
      name: String
      bio: String
      email: String
      avatar: String
      password: String
    ): User

    startSession(name: String!, cardSet: String): Session!
    updateSession(sessionId: String!, name: String, cardSet: String): Session
    deleteSession(sessionId: String!): SuccessMessage!

    addPoll(sessionId: String!, topic: String!, description: String): Poll!
    deletePoll(pollId: String!): SuccessMessage!

    inviteMember(sessionId: String!, email: String!): SuccessMessage
    deleteMember(sessionId: String!, userId: String!): SuccessMessage

    addVote(pollId: String!, userId: String!, value: Int!): Vote
    deleteVote(voteId: String!): SuccessMessage

    updatePollPriority(pollId: String!, priority: String): Poll
  }

  type User {
    id: ID!
    name: String!
    bio: String
    email: String!
    avatar: String
    password: String!
    socialLinks: String
    sessions: [Session!]
    createdAt: String!
    updatedAt: String!
  }

  type Session {
    id: ID!
    name: String!
    cardSet: String!
    createdBy: User!
    polls: [Poll]
    members: [User]
    createdAt: String!
    updatedAt: String!
  }

  type Poll {
    id: ID!
    topic: String!
    description: String
    session: Session!
    votes: [Vote]!
    result: Int
    priority: String
    createdAt: String!
    updatedAt: String!
  }

  type Vote {
    id: ID!
    value: Int!
    poll: Poll!
    user: User
  }

  type SuccessMessage {
    message: String
  }
`

export default schema
