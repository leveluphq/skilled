import * as React from 'react';
import ActionBar from 'components/blocks/ActionBar';
import PageLayoutDefault from 'components/pages/PageLayout/Default';
// import PageWithSidebar from 'components/pages/PageLayout/PageWithSidebar';
import NavigateCourseButtons from 'components/blocks/NavigateCourseButtons';
import StyledMarkdown from 'components/blocks/StyledMarkdown';
import RelatedResources from 'components/blocks/RelatedResources/RelatedResources';
import TitleSection from 'content/blocks/TitleSection';
import { ContentProps } from 'content/props';
// import Sidebar from './Sidebar';

import { ButtonWrapper } from './styles';
import { Wrapper } from '../styles';

interface Props extends ContentProps {
  Content: React.FC;
}

const LearningArticle: React.FC<Props> = ({ lesson, Content }) => {
  return (
    <PageLayoutDefault hideNav disableHeadroom hideContinue>
      <ActionBar slug={lesson.slug} />
      <Wrapper>
        <TitleSection
          hideNavButtons
          LearningOutcomes={null}
          type={lesson.type}
          title={lesson.title}
          slug={lesson.slug}
          categoryTitle={lesson.category.title}
          categorySlug={lesson.category.slug}
          description={lesson.description}
        />
        <StyledMarkdown>
          <Content />
        </StyledMarkdown>
        <RelatedResources slug={lesson.slug} />
        <ButtonWrapper>
          <NavigateCourseButtons slug={lesson.slug} displayText />
        </ButtonWrapper>
        {/* <Sidebar type={lesson.type} /> */}
      </Wrapper>
    </PageLayoutDefault>
  );
};

export default LearningArticle;
