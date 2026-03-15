import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

/**
 * Authentication Link
 * Adds the JWT token to the Authorization header of every request
 */
const authLink = setContext((_, { headers }) => {
  // Get token from localStorage
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('volleycoaching_access_token')
    : null;

  // Return headers with authorization token
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

/**
 * HTTP Link
 * Connects to the GraphQL API
 */
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
  credentials: 'include',
});

const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Configure cache policies for specific queries if needed
          playersByTeam: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default apolloClient;
