import * as React from 'react';
import NextHead from 'next/head';
import { useRouter } from 'next/router';
import { site, absoluteUrl } from 'utils/shared/site';

const DEFAULT_DESCRIPTION = site.description;
const DEFAULT_IMAGE = site.image;

interface Props {
  title?: string;
  description?: string;
  url?: string;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  preventBrandTitle?: boolean;
  useCurrentUrl?: boolean;
  noIndex?: boolean;
  canonicalPath?: string;
  type?: 'website' | 'article' | 'video.other';
}

const addBrandTitle = (title?: string) => `${title} | ${site.name}`;

const getTitle = (title?: string, preventBrandTitle?: boolean) => {
  if (!title) {
    return site.name;
  }

  return preventBrandTitle ? title : addBrandTitle(title);
};

const Head: React.FC<Props> = ({
  title,
  description,
  url,
  ogImage,
  ogImageWidth = 1200,
  ogImageHeight = 630,
  useCurrentUrl: _useCurrentUrl,
  preventBrandTitle,
  noIndex,
  canonicalPath,
  type = 'website',
}) => {
  const router = useRouter();
  const finalTitle = getTitle(title, preventBrandTitle);
  const explicitPath = url ? new URL(url, site.origin).pathname : undefined;
  const finalUrl = absoluteUrl(canonicalPath || explicitPath || router.asPath || '/');

  return (
    <NextHead>
      {(noIndex || !site.indexable) && <meta name="robots" content="noindex" />}

      <title>{finalTitle}</title>
      <link key="canonical" rel="canonical" href={finalUrl} />
      <link rel="describedby" type="text/plain" href={absoluteUrl('/llms.txt')} />
      <meta name="description" content={description || DEFAULT_DESCRIPTION} />
      <meta key="og:url" property="og:url" content={finalUrl} />
      <meta key="og:type" property="og:type" content={type} />
      <meta key="og:site_name" property="og:site_name" content={site.name} />
      <meta key="og:title" property="og:title" content={finalTitle} />
      <meta
        key="og:description"
        property="og:description"
        content={description || DEFAULT_DESCRIPTION}
      />
      <meta key="og:image" property="og:image" content={ogImage || DEFAULT_IMAGE} />
      <meta key="og:image:width" property="og:image:width" content={String(ogImageWidth)} />
      <meta key="og:image:height" property="og:image:height" content={String(ogImageHeight)} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={description || DEFAULT_DESCRIPTION} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={ogImage || DEFAULT_IMAGE} />
    </NextHead>
  );
};

export default Head;
