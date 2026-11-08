import { Props, ComplexityFields } from 'content/blocks/BigOTable/props';
import BigO from 'content/blocks/BigO';

const bigO: Props = {
  items: [
    {
      name: ComplexityFields.Lookup,
      average: BigO.constant,
    },
    {
      name: ComplexityFields.Set,
      average: BigO.constant,
    },
    {
      name: ComplexityFields.SearchUnsorted,
      average: BigO.n,
    },
    {
      name: ComplexityFields.SearchSorted,
      average: BigO.logn,
    },
    {
      name: ComplexityFields.Insert,
      average: BigO.n,
    },
    {
      name: ComplexityFields.Delete,
      average: BigO.n,
    },
    {
      name: ComplexityFields.Append,
      average: BigO.constant,
    },
    {
      name: ComplexityFields.Prepend,
      average: BigO.n,
    },
    {
      name: ComplexityFields.Space,
      average: BigO.n,
    },
  ],
};

export default bigO;
