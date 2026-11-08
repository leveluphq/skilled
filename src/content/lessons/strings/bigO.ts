import { Props, ComplexityFields } from 'content/blocks/BigOTable/props';
import BigO from 'content/blocks/BigO';

const bigO: Props = {
  items: [
    {
      name: ComplexityFields.Traverse,
      average: BigO.n,
      worst: BigO.n,
    },
    {
      name: ComplexityFields.Lookup,
      average: BigO.constant,
      worst: BigO.constant,
    },
    {
      name: ComplexityFields.Copy,
      average: BigO.n,
      worst: BigO.n,
    },
    {
      name: ComplexityFields.Space,
      average: BigO.n,
      worst: BigO.n,
    },
  ],
};

export default bigO;
