import styled from 'styled-components';
import { mobile } from 'style/breakpoints';
import { ContainerLarge } from 'style/elements';

export const ContentWrapper = styled.div`
  padding: 40px 0 72px 0;
`;

export const DocsContainer = styled(ContainerLarge)`
  width: 100%;
`;

export const Title = styled.h1`
  color: ${({ theme }) => theme.color.brand};
  margin-bottom: 12px;
`;

export const Description = styled.p`
  margin-top: 0;
  margin-bottom: 28px;
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: 17px;
`;

export const DocsGrid = styled.div`
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 24px;

  ${mobile()} {
    grid-template-columns: 1fr;
  }
`;

export const Sidebar = styled.nav`
  position: sticky;
  top: 96px;
  align-self: start;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 6px;
  padding: 16px;
  background: ${({ theme }) => theme.color.backgroundSecondary};

  ${mobile()} {
    position: static;
  }
`;

export const SidebarTitle = styled.h2`
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0 0 10px 0;
`;

export const NavList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const NavItem = styled.li`
  margin: 0;
  padding: 0;

  & + & {
    margin-top: 10px;
  }
`;

export const NavLink = styled.a`
  color: ${({ theme }) => theme.color.textSecondary};
  text-decoration: none;
  font-size: 14px;
  line-height: 1.4;

  &:hover {
    color: ${({ theme }) => theme.color.textPrimary};
    text-decoration: underline;
  }
`;

export const Main = styled.div`
  min-width: 0;
`;
