import * as React from 'react';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import StructuredData from 'components/blocks/StructuredData/StructuredData';
import { site, absoluteUrl } from 'utils/shared/site';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: [initialProps.styles, sheet.getStyleElement()],
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="UTF-8" />
          <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />

          {/* meta */}
          <meta name="theme-color" content="#040405" />
          <link rel="manifest" href={`${site.origin}/manifest.json`} />
          <link rel="shortcut icon" href={`${site.origin}/icons/favicon-32x32.png`} />
          <meta name="application-name" content={site.name} />
          <meta name="apple-mobile-web-app-title" content={site.name} />
          {/* <link rel="mask-icon" href="/favicon-mask.svg" color="#FFF300" /> */}

          {/* analytics, on a site with a Google Tag Manager container */}
          {process.env.GOOGLE_TAG_MANAGER_ID && (
            <>
              <script
                dangerouslySetInnerHTML={{
                  __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${process.env.GOOGLE_TAG_MANAGER_ID}');`,
                }}
              />
              <noscript
                dangerouslySetInnerHTML={{
                  __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${process.env.GOOGLE_TAG_MANAGER_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
                }}
              />
            </>
          )}

          {/* google */}
          <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href={`${site.origin}/icons/android-icon-192x192.png`}
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href={`${site.origin}/icons/favicon-32x32.png`}
          />
          <link
            rel="icon"
            type="image/png"
            sizes="96x96"
            href={`${site.origin}/icons/favicon-96x96.png`}
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href={`${site.origin}/icons/favicon-16x16.png`}
          />

          {/* apple */}
          <link rel="apple-touch-icon" href={`${site.origin}/icons/apple-icon.png`} />
          <link
            rel="apple-touch-icon"
            sizes="57x57"
            href={`${site.origin}/icons/apple-icon-57x57.png`}
          />
          <link
            rel="apple-touch-icon"
            sizes="60x60"
            href={`${site.origin}/icons/apple-icon-60x60.png`}
          />
          <link
            rel="apple-touch-icon"
            sizes="72x72"
            href={`${site.origin}/icons/apple-icon-72x72.png`}
          />
          <link
            rel="apple-touch-icon"
            sizes="76x76"
            href={`${site.origin}/icons/apple-icon-76x76.png`}
          />
          <link
            rel="apple-touch-icon"
            sizes="114x114"
            href={`${site.origin}/icons/apple-icon-114x114.png`}
          />
          <link
            rel="apple-touch-icon"
            sizes="120x120"
            href={`${site.origin}/icons/apple-icon-120x120.png`}
          />
          <link
            rel="apple-touch-icon"
            sizes="144x144"
            href={`${site.origin}/icons/apple-icon-144x144.png`}
          />
          <link
            rel="apple-touch-icon"
            sizes="152x152"
            href={`${site.origin}/icons/apple-icon-152x152.png`}
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href={`${site.origin}/icons/apple-icon-180x180.png`}
          />

          {/* microsoft */}
          <meta name="msapplication-TileColor" content="#040405" />
          <meta name="msapplication-config" content={`${site.origin}/browserconfig.xml`} />
          <meta
            name="msapplication-TileImage"
            content={`${site.origin}/icons/ms-icon-144x144.png`}
          />

          {/* facebook */}
          <meta property="fb:app_id" content={process.env.FACEBOOK_APP_ID} />

          {/* twitter */}
          {site.twitter && <meta name="twitter:site" content={site.twitter} />}
          <link rel="preconnect" href="https://fonts.gstatic.com/"></link>
          <link
            href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          <StructuredData
            data={[
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                '@id': `${site.origin}/#website`,
                name: site.name,
                url: absoluteUrl('/'),
                description: site.description,
              },
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                '@id': `${site.origin}/#publisher`,
                name: site.name,
                url: absoluteUrl('/'),
                logo: site.logo,
              },
            ]}
          />
        </body>
      </Html>
    );
  }
}
