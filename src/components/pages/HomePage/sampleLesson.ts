// TODO: Pull this using getStaticProps

// TODO: Import the content from the lesson

import { video } from 'content/lessons/walk-a-matrix/data';
import getUserAnswer from 'content/lessons/walk-a-matrix/UserAnswer';
import getTests from 'content/lessons/walk-a-matrix/Tests';
import getSolutionCode from 'content/lessons/walk-a-matrix/Solution/code/Solution';
import QuestionStatement from 'content/lessons/walk-a-matrix/QuestionStatement';
import Introduction from 'content/lessons/walk-a-matrix/Introduction';
import Solution from 'content/lessons/walk-a-matrix/Solution';
import LearningOutcomes from 'content/lessons/walk-a-matrix/LearningOutcomes';
import validationItems from 'content/lessons/walk-a-matrix/Validation';
import explanationItems from 'content/lessons/walk-a-matrix/Explanation';

const sampleLesson = {
  video,
  getUserAnswer,
  getTests,
  getSolutionCode,
  Introduction,
  QuestionStatement,
  Solution,
  explanationItems,
  validationItems,
  LearningOutcomes,
  updatedAt: '2020-11-10T00:50:27.518907+00:00',
  type: 'QUESTION',
  title: 'Walk a Matrix',
  status: 'ACTIVE',
  solutionVideoUrl: 'https://youtu.be/4Z1ZuW2UN-c',
  slug: 'walk-a-matrix',
  position: 102,
  metaTitle: null,
  metaDescription: null,
  introductionVideoUrl: null,
  id: 'daa7d7ac-f39f-4a33-ab77-07002ea8ab58',
  difficulty: 'EASY',
  description: '',
  createdAt: '2020-04-02T03:21:46.186816+00:00',
  categoryId: 'd0b26d44-d19e-4dd9-84f5-3ae72005b589',
  accessLevel: 'FREE',
};

export default sampleLesson;
