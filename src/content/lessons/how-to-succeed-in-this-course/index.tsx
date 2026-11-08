import * as React from 'react';
import { ContentProps } from 'content/props';
import LearningArticle from 'content/templates/LearningArticle';
import Content from './article.mdx';

const Lesson: React.FC<ContentProps> = (props) => <LearningArticle {...props} Content={Content} />;

export default Lesson;
