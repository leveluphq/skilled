import dynamic from 'next/dynamic';
import blogSlugs from './generated/blogSlugs.gen';

interface BlogImport {
  [key: string]: React.ComponentType;
}

export const blogImports: BlogImport = blogSlugs.reduce(
  (acc, curr) => {
    acc[curr] = dynamic(() => import(`./blog/${curr}`));
    return acc;
  },
  {} as BlogImport,
);
