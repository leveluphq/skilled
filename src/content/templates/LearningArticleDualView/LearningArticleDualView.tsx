import * as React from 'react';
import RelatedResources from 'components/blocks/RelatedResources/RelatedResources';
import { useLessonDimensions } from 'components/context/AppState/useAppState';
import PageWithVideo from 'components/pages/PageLayout/PageWithVideo';
import NavigateCourseButtons from 'components/blocks/NavigateCourseButtons';
import StyledMarkdown from 'components/blocks/StyledMarkdown';
import TitleSection from 'content/blocks/TitleSection';
import ActionBar from 'components/blocks/ActionBar';
import LessonVideo from 'components/blocks/LessonVideo';
import { ContentProps } from 'content/props';
import { VideoDetails } from 'utils/constants/lesson';
import useFetchSolutionVideo from 'components/hooks/useFetchSolutionVideo';

import {
  Wrapper,
  ButtonWrapper,
  PageContainer,
  ArticleSection,
  VideoSection,
  VisibleMobile,
} from './styles';

interface Props extends ContentProps {
  Content: React.FC<{ slug: string }>;
  video: VideoDetails;
}

const LearningArticleDualView: React.FC<Props> = ({ lesson, Content, video }) => {
  const { videoWidth, textWidth } = useLessonDimensions();
  const { solutionVideoUrl, hasFetchedVideo } = useFetchSolutionVideo(lesson.id);

  return (
    <PageWithVideo disableHeadroom hideContinue>
      <PageContainer>
        <ActionBar slug={lesson.slug} />
        <Wrapper>
          <ArticleSection width={textWidth}>
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
            <VisibleMobile>
              <LessonVideo
                hideTableOfContents
                url={solutionVideoUrl}
                segments={video.segments}
                changesSinceRecording={video.changesSinceRecording}
                isLoading={!hasFetchedVideo}
                uniqueKey={`${lesson.id}-mobile`}
                slug={lesson.slug}
              />
            </VisibleMobile>
            <StyledMarkdown>
              <Content slug={lesson.slug} />
            </StyledMarkdown>
            <RelatedResources slug={lesson.slug} />
            <ButtonWrapper>
              <NavigateCourseButtons slug={lesson.slug} displayText />
            </ButtonWrapper>
          </ArticleSection>
          <VideoSection width={videoWidth}>
            <LessonVideo
              url={solutionVideoUrl}
              segments={video.segments}
              changesSinceRecording={video.changesSinceRecording}
              isLoading={!hasFetchedVideo}
              uniqueKey={`${lesson.id}-desktop`}
              slug={lesson.slug}
            />
          </VideoSection>
        </Wrapper>
      </PageContainer>
    </PageWithVideo>
  );
};

export default LearningArticleDualView;
