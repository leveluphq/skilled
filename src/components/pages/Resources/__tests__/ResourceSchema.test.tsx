import * as React from 'react';
import { render } from '@testing-library/react';
import { resources, resourcePath } from 'content/resources';
import { absoluteUrl, site } from 'utils/shared/site';
import ResourcePage from '../ResourcePage';
import { programmingLanguageLabel } from 'utils/shared/programmingLanguages';
import { getLanguageResources } from 'content/resources';

jest.mock('components/blocks/Head', () => () => null);

it('describes the cross-language operations reference with all ten subjects and includes it in each language path', () => {
  const resource = resources.find((item) => item.slug === 'programming-language-operations')!;
  const { container } = render(
    <ResourcePage resourceId="reference/programming-language-operations" headings={[]} minutes={6}>
      Reference
    </ResourcePage>,
  );
  const [page] = JSON.parse(
    container.querySelector('script[type="application/ld+json"]')!.textContent!,
  );
  expect(page.inLanguage).toBe('en');
  expect(page.about).toHaveLength(10);
  for (const language of resource.languages!) {
    expect(page.about).toContainEqual(
      expect.objectContaining({
        '@type': 'ComputerLanguage',
        name: programmingLanguageLabel(language),
        url: absoluteUrl(`/interview-prep/${language}`),
      }),
    );
    expect(getLanguageResources(language)).toContain(resource);
  }
});

it('describes every interactive resource as a free WebApplication within its page JSON-LD', () => {
  for (const resource of resources.filter((item) => item.section === 'tools')) {
    const { container, unmount } = render(
      <ResourcePage
        resourceId={`tools/${resource.slug}`}
        headings={[]}
        minutes={1}
        Tool={() => <p>Interactive controls</p>}
      >
        Explanation
      </ResourcePage>,
    );
    const [page, breadcrumbs] = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent!,
    );
    const url = absoluteUrl(resourcePath(resource));
    expect(page['@type']).toBe('WebPage');
    expect(page.isPartOf).toEqual({ '@id': `${site.origin}/#website` });
    expect(page.mainEntity).toMatchObject({
      '@type': 'WebApplication',
      '@id': `${url}#application`,
      url,
      name: resource.title,
      description: resource.description,
      applicationCategory: 'EducationalApplication',
      isAccessibleForFree: true,
      publisher: { '@id': `${site.origin}/#publisher` },
    });
    expect(page.mainEntity.aggregateRating).toBeUndefined();
    expect(page.mainEntity.offers).toBeUndefined();
    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
    expect(breadcrumbs.itemListElement[2].item).toBe(url);
    unmount();
  }
});

it('keeps article metadata distinct and does not describe an absent tool as an application', () => {
  for (const id of ['patterns/tries', 'tools/javascript-output-quiz']) {
    const { container, unmount } = render(
      <ResourcePage resourceId={id} headings={[]} minutes={1}>
        Explanation
      </ResourcePage>,
    );
    const [page] = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent!,
    );
    expect(page.mainEntity).toBeUndefined();
    expect(page['@type']).toBe(id.startsWith('patterns') ? 'TechArticle' : 'WebPage');
    unmount();
  }
});

it('identifies every language-tagged resource with the programming language as its subject', () => {
  for (const resource of resources.filter((item) => item.language)) {
    const { container, unmount } = render(
      <ResourcePage resourceId={`${resource.section}/${resource.slug}`} headings={[]} minutes={1}>
        Explanation
      </ResourcePage>,
    );
    const [page] = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent!,
    );
    expect(page.about).toMatchObject({
      '@type': 'ComputerLanguage',
      name: programmingLanguageLabel(resource.language!),
      url: absoluteUrl(`/interview-prep/${resource.language}`),
    });
    expect(page.inLanguage).toBe('en');
    expect(page.programmingLanguage).toBeUndefined();
    unmount();
  }
});
