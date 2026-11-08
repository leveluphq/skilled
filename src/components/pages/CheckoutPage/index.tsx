import * as React from 'react';
import { useGetViewerLazyQuery } from 'types/generated/client';
import useStaticViewerToken from 'components/hooks/useStaticViewerToken';
import { DisplayProduct } from 'utils/shared/products/buildDisplayProduct';
import CheckoutPage from './CheckoutPage';
import Head from 'components/blocks/Head';

const IMMEDIATE = true;

const CheckoutPageContainer: React.FC<{ products: DisplayProduct[] }> = ({ products }) => {
  const viewerToken = useStaticViewerToken(IMMEDIATE);
  const [getViewer, { data, loading, error, called }] = useGetViewerLazyQuery();

  React.useEffect(() => {
    if (viewerToken) {
      getViewer({
        variables: {
          id: viewerToken,
        },
      });
    }
  }, [viewerToken]);

  return (
    <>
      <Head title="Checkout" noIndex canonicalPath="/checkout" />
      {viewerToken ? (
        <CheckoutPage loading={loading || !called} error={error} data={data} products={products} />
      ) : (
        <CheckoutPage loading={!process.browser} products={products} />
      )}
    </>
  );
};

export default CheckoutPageContainer;
