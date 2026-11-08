import withApollo from 'utils/client/withApollo';
import SettingsPage from 'components/pages/SettingsPage';

export default withApollo(SettingsPage, { ssr: false });
