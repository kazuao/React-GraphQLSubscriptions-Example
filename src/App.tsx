import { ApolloProvider } from '@apollo/client'
import { MessageList } from './components/MessageList'
import { client } from './apolloClient'

function App() {
  return (
    <ApolloProvider client={client}>
      <MessageList />
    </ApolloProvider>
  )
}

export default App
