import * as React from 'react';
import ViewerContext from 'components/context/ViewerContext';
import { useGetViewerQuery } from 'types/generated/client';
import Head from 'components/blocks/Head';
import { DisplayProduct } from 'utils/shared/products/buildDisplayProduct';
import PricingPage from './PricingPage';

const TITLE = 'Pricing';
const DESCRIPTION =
  'Join Skilled.dev and get access to the full course that will show you how to land the software engineering job and increase your salary.';

const PricingPageContainer: React.FC<{ products: DisplayProduct[] }> = ({ products }) => {
  const viewerToken = React.useContext(ViewerContext);

  if (viewerToken) {
    const { data, loading, error } = useGetViewerQuery({ variables: { id: viewerToken } });
    return (
      <>
        <Head title={TITLE} description={DESCRIPTION} useCurrentUrl />

        <PricingPage loading={loading} error={error} data={data} products={products} />
      </>
    );
  } else {
    return (
      <>
        <Head title={TITLE} description={DESCRIPTION} useCurrentUrl />

        <PricingPage loading={false} products={products} />
      </>
    );
  }
};

export default PricingPageContainer;
