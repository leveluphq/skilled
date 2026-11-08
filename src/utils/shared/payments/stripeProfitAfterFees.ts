const FLAT_FEE = 0.3;
const VARIABLE_SALE_FEE = 0.029;

const stripeProfitAfterFees = (revenueInDollars: number) => {
  const profit = revenueInDollars - revenueInDollars * VARIABLE_SALE_FEE - FLAT_FEE;
  return profit;
};

export default stripeProfitAfterFees;
