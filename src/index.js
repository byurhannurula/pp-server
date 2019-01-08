import dotenv from 'dotenv'
import express from 'express'
import { ApolloServer, gql } from 'apollo-server-express'

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
})

const port = process.env.APP_PORT || 4000
const dev = process.env.NODE_ENV !== 'production'

const startServer = async () => {
  const app = express()

  const typeDefs = gql`
    type Query {
      hello: String
    }
  `

  const resolvers = {
    Query: {
      hello: () => 'Hello World!',
    },
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    playground: dev,
  })

  server.applyMiddleware({ app })

  app.listen({ port }, () =>
    console.log(
      `🚀  Server ready at http://localhost:${port}${server.graphqlPath}`,
    ),
  )
}

startServer()
