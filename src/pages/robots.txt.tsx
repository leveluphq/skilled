import { GetServerSideProps } from 'next';
import { buildRobots } from 'utils/server/discovery';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=60');
  res.end(buildRobots());
  return { props: {} };
};
export default function Robots() {
  return null;
}
