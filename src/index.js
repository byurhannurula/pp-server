import dotenv from 'dotenv'
import express from 'express'
import { createMongoConn } from './createMongoConn'
import { ApolloServer } from 'apollo-server-express'

import typeDefs from './schema'
import resolvers from './resolvers'

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
})

const port = process.env.APP_PORT || 4000
const dev = process.env.NODE_ENV !== 'production'

const startServer = async () => {
  await createMongoConn()

  const app = express()

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
