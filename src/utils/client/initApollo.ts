import * as http from 'http';
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  NormalizedCacheObject,
  defaultDataIdFromObject,
  createHttpLink,
  HttpOptions,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import fetch from 'isomorphic-unfetch';
import Sentry from 'utils/shared/sentry';
import { Users_Lessons_Status } from 'types/generated/client';

const LESSON_STATUS_TYPENAME: Users_Lessons_Status['__typename'] = 'users_lessons_status';
const GRAPHQL_PROXY_PATH = '/api/graphql';

export interface InitApolloOptions {
  clientState?: object;
  headers?: http.IncomingHttpHeaders;
}

let apolloClient: ApolloClient<NormalizedCacheObject>;

const getHeaderValue = (value?: string | string[]) => {
  if (!value) {
    return '';
  }

  if (Array.isArray(value)) {
    return value[0] || '';
  }

  return value;
};

const getServerGraphqlUri = (headers: http.IncomingHttpHeaders = {}) => {
  const host = getHeaderValue(headers.host);
  const forwardedProto = getHeaderValue(headers['x-forwarded-proto']);

  if (host) {
    const protocol = forwardedProto || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    return `${protocol}://${host}${GRAPHQL_PROXY_PATH}`;
  }

  if (process.env.ROOT_URL) {
    return `${process.env.ROOT_URL}${GRAPHQL_PROXY_PATH}`;
  }

  return `http://localhost:3000${GRAPHQL_PROXY_PATH}`;
};

// NOTE: Use Apollo Boost when it is more supported
function createApolloClient(initialState: any = {}, options: InitApolloOptions = {}) {
  const isServer = typeof window === 'undefined';
  const uri = isServer ? getServerGraphqlUri(options.headers) : GRAPHQL_PROXY_PATH;

  const httpOptions: HttpOptions = {
    uri,
    fetch,
    fetchOptions: {
      mode: 'cors',
    },
    credentials: 'same-origin',
    headers: {
      ...(options.headers || {}),
    },
  };

  const httpLink = createHttpLink(httpOptions);
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message }) => {
        Sentry.withScope((_scope) => {
          Sentry.captureMessage(message);
        });
      });
    }
    if (networkError) {
      Sentry.withScope((_scope) => {
        Sentry.captureException(networkError);
      });
    }
  });

  return new ApolloClient<NormalizedCacheObject>({
    connectToDevTools: !isServer,
    ssrMode: isServer, // Disables forceFetch on the server (so queries are only run once)
    // @ts-ignore errorLink is showing a incompatible TS error but these are all official apollo links
    link: ApolloLink.from([errorLink, httpLink]),
    cache: new InMemoryCache({
      dataIdFromObject: (object) => {
        switch (object.__typename) {
          case LESSON_STATUS_TYPENAME: {
            const usersLessonsStatusObject = object as Users_Lessons_Status;
            return `${usersLessonsStatusObject.__typename}:${usersLessonsStatusObject.userId}:${usersLessonsStatusObject.lessonId}`;
          }
          default:
            return defaultDataIdFromObject(object); // fall back to default handling
        }
      },
    }).restore(initialState),
    // clientState, @apollo/client syntax for local state
  });
}

export default function initApollo(initialState: any = {}, options: InitApolloOptions = {}) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === 'undefined') {
    return createApolloClient(initialState, options);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = createApolloClient(initialState, options);
  }

  return apolloClient;
}
