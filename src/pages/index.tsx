import HomePage from 'components/pages/HomePage';
import withApollo from 'utils/client/withApollo';

export default withApollo(HomePage, { ssr: false });
