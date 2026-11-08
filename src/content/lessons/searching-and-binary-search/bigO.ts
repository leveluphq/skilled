import { Props, ComplexityFields } from 'content/blocks/BigOTable/props';
import BigO from 'content/blocks/BigO';

const bigO: Props = {
  items: [
    {
      name: ComplexityFields.SearchSorted,
      average: BigO.logn,
      worst: BigO.logn,
    },
    {
      name: ComplexityFields.SearchUnsorted,
      average: BigO.n,
      worst: BigO.n,
    },
  ],
};

export default bigO;
