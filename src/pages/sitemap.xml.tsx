import { GetServerSideProps } from 'next';
import { buildSitemap } from 'utils/server/discovery';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=60');
  res.end(buildSitemap());
  return { props: {} };
};
export default function Sitemap() {
  return null;
}
