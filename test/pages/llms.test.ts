import { createMocks } from 'node-mocks-http';
import { getServerSideProps } from 'pages/llms.txt';

it('serves the public text map without a session and keeps the map itself out of the search index', async () => {
  const { res } = createMocks();
  const result = await getServerSideProps({ res } as any);
  expect(result).toEqual({ props: {} });
  expect(res._isEndCalled()).toBe(true);
  expect(res._getStatusCode()).toBe(200);
  expect(res.getHeader('Content-Type')).toBe('text/plain; charset=utf-8');
  expect(res.getHeader('X-Robots-Tag')).toBe('noindex');
  expect(res.getHeader('X-Content-Type-Options')).toBe('nosniff');
  expect(res._getData()).toContain('/interview-prep/cpp');
  expect(res._getData()).toContain('/tools/javascript-output-quiz');
});
