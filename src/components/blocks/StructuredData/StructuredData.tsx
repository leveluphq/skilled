import * as React from 'react';

/** Escape HTML delimiters even when a future publisher adds them to a title. */
export const serializeStructuredData = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

const StructuredData: React.FC<{ data: Record<string, unknown> | Record<string, unknown>[] }> = ({
  data,
}) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: serializeStructuredData(data) }}
  />
);

export default StructuredData;
