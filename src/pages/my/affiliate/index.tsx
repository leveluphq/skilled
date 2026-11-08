import withApollo from 'utils/client/withApollo';
import AffiliatePage from 'components/pages/AffiliatePage';

export default withApollo(AffiliatePage, { ssr: false });
