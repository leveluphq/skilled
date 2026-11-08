import { OauthProvider } from 'utils/constants/auth';

export interface CompanyButtonProps {
  company: OauthProvider;
  product?: string;
}

export interface ButtonProps {
  content?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}
