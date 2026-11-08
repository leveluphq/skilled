import { Props, ComplexityFields } from 'content/blocks/BigOTable/props';
import BigO from 'content/blocks/BigO';

const bigO: Props = {
  items: [
    {
      name: ComplexityFields.Lookup,
      average: BigO.n,
      worst: BigO.n,
    },
    {
      name: ComplexityFields.Search,
      average: BigO.n,
      worst: BigO.n,
    },
    {
      name: ComplexityFields.Delete,
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
