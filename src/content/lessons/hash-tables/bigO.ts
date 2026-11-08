import { Props, ComplexityFields } from 'content/blocks/BigOTable/props';
import BigO from 'content/blocks/BigO';

const bigO: Props = {
  items: [
    {
      name: ComplexityFields.Lookup,
      average: BigO.constant,
      worst: BigO.n,
    },
    {
      name: ComplexityFields.Set,
      average: BigO.constant,
      worst: BigO.n,
    },
    {
      name: ComplexityFields.Insert,
      average: BigO.constant,
      worst: BigO.n,
    },
    {
      name: ComplexityFields.Delete,
      average: BigO.constant,
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
