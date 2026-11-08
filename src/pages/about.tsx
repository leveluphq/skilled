import AboutPage from 'components/pages/AboutPage';
import withApollo from 'utils/client/withApollo';

export default withApollo(AboutPage, { ssr: false });
