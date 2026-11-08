import { Props, ComplexityFields } from 'content/blocks/BigOTable/props';
import BigO from 'content/blocks/BigO';

const bigO: Props = {
  items: [
    {
      name: ComplexityFields.Enqueue,
      average: BigO.constant,
      worst: BigO.constant,
    },
    {
      name: ComplexityFields.Dequeue,
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
