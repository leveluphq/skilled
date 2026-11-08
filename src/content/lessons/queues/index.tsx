import * as React from 'react';
import { ContentProps } from 'content/props';
import LearningArticleDualView from 'content/templates/LearningArticleDualView';
import { video } from './data';
import Content from './article.mdx';

const Lesson: React.FC<ContentProps> = (props) => (
  <LearningArticleDualView {...props} Content={Content} video={video} />
);

export default Lesson;
