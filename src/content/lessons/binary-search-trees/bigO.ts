import { Props, ComplexityFields } from 'content/blocks/BigOTable/props';
import BigO from 'content/blocks/BigO';

const bigO: Props = {
  items: [
    {
      name: ComplexityFields.Lookup,
      average: BigO.logn,
      worst: BigO.logn,
    },
    {
      name: ComplexityFields.Insert,
      average: BigO.logn,
      worst: BigO.logn,
    },
    {
      name: ComplexityFields.Delete,
      average: BigO.logn,
      worst: BigO.logn,
    },
    {
      name: ComplexityFields.Search,
      average: BigO.logn,
      worst: BigO.logn,
    },
    {
      name: ComplexityFields.Space,
      average: BigO.n,
      worst: BigO.n,
    },
  ],
};

export default bigO;
