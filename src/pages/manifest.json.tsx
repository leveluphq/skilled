import { GetServerSideProps } from 'next';
import { buildManifest } from 'utils/server/siteManifest';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=60');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.end(JSON.stringify(buildManifest()));
  return { props: {} };
};

export default function Manifest() {
  return null;
}
