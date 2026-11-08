import { Company } from 'utils/constants/auth';
import {
  CarbonIconType,
  LogoFacebook20,
  LogoGithub20,
  LogoLinkedin20,
  LogoTwitter20,
} from '@carbon/icons-react';
import { IconType } from 'react-icons';
import { FaGoogle } from 'react-icons/fa';

type CompanyMap = Record<Company, string>;
type CompanyMapIcon = Record<Company, CarbonIconType | IconType>;

export const color: CompanyMap = {
  [Company.Facebook]: '#3C5B96',
  [Company.Twitter]: '#1E99E6',
  [Company.Google]: '#DB4C3F',
  [Company.Linkedin]: '#2789BC',
  [Company.Github]: '#000000',
};

export const hover: CompanyMap = {
  [Company.Facebook]: '#304D8A',
  [Company.Twitter]: '#34A1E5',
  [Company.Google]: '#E0321C',
  [Company.Linkedin]: '#147BAF',
  [Company.Github]: '#090909',
};

export const icon: CompanyMapIcon = {
  [Company.Facebook]: LogoFacebook20,
  [Company.Twitter]: LogoTwitter20,
  [Company.Google]: FaGoogle,
  [Company.Linkedin]: LogoLinkedin20,
  [Company.Github]: LogoGithub20,
};

export const name: CompanyMap = {
  [Company.Facebook]: 'Facebook',
  [Company.Twitter]: 'Twitter',
  [Company.Google]: 'Google',
  [Company.Linkedin]: 'LinkedIn',
  [Company.Github]: 'GitHub',
};

export default {
  Company,
  color,
  hover,
  icon,
  name,
};
