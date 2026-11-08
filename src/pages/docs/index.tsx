import DocsPage from 'components/pages/DocsPage';
import withApollo from 'utils/client/withApollo';

export default withApollo(DocsPage, { ssr: false });
