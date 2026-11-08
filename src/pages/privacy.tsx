import PrivacyPage from 'components/pages/PrivacyPage';
import withApollo from 'utils/client/withApollo';

export default withApollo(PrivacyPage, { ssr: false });
