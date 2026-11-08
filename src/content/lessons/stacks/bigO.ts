import { Props, ComplexityFields } from 'content/blocks/BigOTable/props';
import BigO from 'content/blocks/BigO';

const bigO: Props = {
  items: [
    {
      name: ComplexityFields.Push,
      average: BigO.constant,
      worst: BigO.constant,
    },
    {
      name: ComplexityFields.Pop,
      average: BigO.constant,
      worst: BigO.constant,
    },
    {
      name: ComplexityFields.Peek,
      average: BigO.constant,
      worst: BigO.constant,
    },
    {
      name: ComplexityFields.Space,
      average: BigO.n,
      worst: BigO.n,
    },
  ],
};

export default bigO;
