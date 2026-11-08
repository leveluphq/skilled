import { GetServerSideProps } from 'next';
import { buildLlms } from 'utils/server/llms';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=60');
  res.end(buildLlms());
  return { props: {} };
};
export default function Llms() {
  return null;
}
