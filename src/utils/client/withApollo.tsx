import * as React from 'react';
import { NextPageContext, NextPage } from 'next';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ApolloProvider } from '@apollo/react-hooks';
import { getCookie, getViewerFromCookie } from 'utils/client/auth';
import ThemeProvider from 'components/context/ThemeProvider';
import ViewerContext from 'components/context/ViewerContext';
import CodingLanguageProvider from 'components/context/CodingLanguage/CodingLanguageProvider';
import AppStateProvider from 'components/context/AppState/AppStateProvider';
import AffiliateTracker from 'components/blocks/AffiliateTracker';
import { filterClientReadableCookies } from 'utils/shared/cookies';
import initApollo, { InitApolloOptions } from './initApollo';
import { NOT_FOUND_MESSAGE } from './throw404';

// NOTE: For some reason TS is not recognizing that App extends React.Component. ignoring in places in file

interface ExtendedProps {
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

interface WithApolloProps {
  apolloClient: ApolloClient<NormalizedCacheObject>;
  apolloState: any;
  initApolloOptions: InitApolloOptions;
  displayName: string;
  cookie: string;
}

type withApollo = (
  PageComponent: NextPage<any, any>,
  options?: { ssr?: boolean; static?: boolean },
) => React.FC<any>;

const withApollo: withApollo = (PageComponent, options = {}) => {
  const { ssr = true } = options;

  const WithApollo: React.FC<WithApolloProps> = ({
    apolloClient,
    apolloState,
    initApolloOptions,
    cookie,
    ...pageProps
  }) => {
    let finalInitApolloOptions = initApolloOptions;
    let finalCookie = cookie;

    // NOTE: !ssr means it's CSR or SSG, so we need to get these fields on the client
    if (typeof window !== 'undefined' && !ssr) {
      finalCookie = getCookie();
      finalInitApolloOptions = {
        headers: {},
      };
    }

    const client = apolloClient || initApollo(apolloState, finalInitApolloOptions);
    const currentViewer = getViewerFromCookie(finalCookie);

    return (
      <>
        <ApolloProvider client={client}>
          <ViewerContext.Provider value={currentViewer.id}>
            <ThemeProvider>
              <CodingLanguageProvider>
                <AppStateProvider cookie={finalCookie}>
                  <AffiliateTracker>
                    <PageComponent {...pageProps} />
                  </AffiliateTracker>
                </AppStateProvider>
              </CodingLanguageProvider>
            </ThemeProvider>
          </ViewerContext.Provider>
        </ApolloProvider>
      </>
    );
  };

  if (process.env.NODE_ENV !== 'production') {
    const displayName = PageComponent.displayName || PageComponent.name || 'Component';

    if (displayName === 'App') {
      console.warn('This withApollo HOC only works with PageComponents.');
    }

    WithApollo.displayName = `withApollo(${displayName})`;
  }

  if (ssr || PageComponent.getInitialProps) {
    // @ts-ignore Property 'getInitialProps'
    WithApollo.getInitialProps = async (ctx: NextPageContext & ExtendedProps) => {
      const { AppTree } = ctx;
      // NOTE NEED TO MAKE SURE THIS COOKIE IS ALWAYS PASSED FROM SERVER. Is this the right way to do it?
      const cookie = getCookie(ctx);
      const clientCookie = filterClientReadableCookies(cookie);
      const initApolloOptions: InitApolloOptions = {
        headers: {},
      };
      let pageProps = {};
      let apolloState;

      if (cookie) {
        initApolloOptions.headers!.cookie = cookie;
      }

      // Initialize ApolloClient, add it to the ctx object so
      // we can use it in `PageComponent.getInitialProp`.
      const apolloClient = (ctx.apolloClient = initApollo(undefined, initApolloOptions));

      // Run wrapped getInitialProps methods
      if (PageComponent.getInitialProps) {
        pageProps = await PageComponent.getInitialProps(ctx);
      }

      // Only on the server:
      const isServer = typeof window === 'undefined';
      if (isServer) {
        // When redirecting, the response is finished.
        // No point in continuing to render
        if (ctx.res && ctx.res.finished) {
          return pageProps;
        }

        if (ssr) {
          try {
            // Run all GraphQL queries
            const { getDataFromTree } = await import('@apollo/react-ssr');

            await getDataFromTree(
              <AppTree
                pageProps={{
                  ...pageProps,
                  initApolloOptions,
                  apolloClient,
                  cookie: clientCookie,
                }}
              />,
            );
          } catch (error) {
            // Prevent Apollo Client GraphQL errors from crashing SSR.
            // Handle them in components via the data.error prop:
            // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
            console.error('Error while running `getDataFromTree`', error);
            if (error && typeof error === 'object' && 'code' in error && error.code === NOT_FOUND_MESSAGE) {
              throw error;
            }
          }

          // getDataFromTree does not call componentWillUnmount
          // head side effect therefore need to be cleared manually
          // REMOVE WHEN UPGRADING TO NEXT 11
          // Head.rewind();
        }
      }

      // Extract query data from the Apollo store
      apolloState = apolloClient.cache.extract();

      // Everything returned here is serialized into `__NEXT_DATA__` and is readable
      // by any script on the page. `initApolloOptions` carries the forwarded Cookie
      // header used for server-to-Hasura calls, so it is replaced with an empty
      // header set: in the browser, Apollo requests are same-origin and the browser
      // attaches cookies itself.
      return {
        ...pageProps,
        initApolloOptions: { headers: {} },
        apolloState,
        cookie: clientCookie,
      };
    };
  }

  return WithApollo;
};

export default withApollo;
