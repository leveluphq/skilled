import { NextPage } from 'next';
import { logout } from 'utils/server/jwt';

const LogoutPage: NextPage = () => {
  return null;
};

// TODO: Make this a page that clears client and server storage if I ever move to an SSG model
LogoutPage.getInitialProps = ({ res }) => {
  if (!res) {
    // TODO: Handle things on client for clearing later
    window.location.href = '/logout';
    return {};
  }

  logout(res);

  res.writeHead(302, {
    Location: '/',
  });

  res.end();

  return {};
};

export default LogoutPage;
