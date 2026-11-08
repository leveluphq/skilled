import { GetStaticProps, InferGetStaticPropsType } from 'next';
import stripe from 'services/server/stripe/instance';
import getActiveProducts from 'services/server/graphql/queries/getActiveProducts';
import buildDisplayProduct, { DisplayProduct } from 'utils/shared/products/buildDisplayProduct';
import PricingPage from 'components/pages/PricingPage';
import withApollo from 'utils/client/withApollo';

export const getStaticProps: GetStaticProps<{ products: DisplayProduct[] }> = async () => {
  const serverProducts = await getActiveProducts();

  if (!serverProducts) {
    throw new Error('No active products');
  }

  const stripeProductRequests = serverProducts.map((product) =>
    stripe.products.retrieve(product.stripeProductId),
  );
  const stripePriceRequests = serverProducts.map((product) =>
    stripe.prices.retrieve(product.stripePriceId),
  );

  const stripeProducts = await Promise.all(stripeProductRequests);
  const stripePrices = await Promise.all(stripePriceRequests);

  // NOTE: Since I'm using promise.all, it will be in the same order as the server products already
  const products = serverProducts.map((product, i) => {
    return buildDisplayProduct(product, stripeProducts[i], stripePrices[i]);
  });

  return {
    props: {
      products,
    },
  };
};

export type StaticProps = InferGetStaticPropsType<typeof getStaticProps>;

export default withApollo(PricingPage, { ssr: false });
