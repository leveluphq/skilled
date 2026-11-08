export enum HttpMethods {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE',
}

export interface LinkProps {
  href?: string;
  text?: string;
}

export const EMPTY_LINK_PROPS: LinkProps = {
  href: '',
  text: '',
};

export interface ErrorObject {
  statusCode?: number;
  message?: string;
}
