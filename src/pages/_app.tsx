import * as React from 'react';
import Head from 'next/head';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

import 'utils/shared/sentry';

export default function MyApp({ Component, pageProps }: any) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="monetization" content="$ilp.uphold.com/4FZDaEHX9323" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
