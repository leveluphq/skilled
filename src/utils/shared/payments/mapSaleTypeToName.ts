import { SaleType } from 'utils/constants/payments';

const typeToName = {
  [SaleType.FullCourse]: 'Course',
  [SaleType.GiftCard]: 'Gift Card',
  [SaleType.Cart]: 'Cart',
};

const mapSaleTypeToName = (type: SaleType) => {
  return typeToName[type];
};

export default mapSaleTypeToName;
