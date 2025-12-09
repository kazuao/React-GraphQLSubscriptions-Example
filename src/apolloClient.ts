import { ApolloClient, InMemoryCache } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'

// WebSocket 経由で全操作（Query/Mutation/Subscription）を送信するクライアント
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql',
  }),
)

export const client = new ApolloClient({
  link: wsLink,
  cache: new InMemoryCache(),
})
