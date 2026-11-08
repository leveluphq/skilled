import { serializeStructuredData } from 'components/blocks/StructuredData/StructuredData';

it('keeps metadata inside its JSON script and preserves the original text on parsing', () => {
  const data = {
    headline: '</script><script>alert("example")</script>',
    description: 'one\u2028two\u2029three',
  };
  const serialized = serializeStructuredData(data);
  expect(serialized).not.toMatch(/[<\u2028\u2029]/);
  expect(JSON.parse(serialized)).toEqual(data);
});
