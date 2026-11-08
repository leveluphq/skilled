import { useReducer, useEffect } from 'react';

interface Props {
  explanationLength: number;
  validationLength: number;
}

enum ActionTypes {
  SetQuestionComplete,
  IncrementExplanation,
  IncrementValidation,
  SetTotalExplanationSteps,
  SetTotalValidationSteps,
}

export enum SectionType {
  Explanation = 'EXPLANATION',
  Validation = 'VALIDATION',
  Solution = 'SOLUTION',
}

interface State {
  explanationStepsViewed: number;
  totalExplanationSteps: number;
  isExplanationTotalSet: boolean;
  validationStepsViewed: number;
  totalValidationSteps: number;
  isValidationTotalSet: boolean;
  activeSection: SectionType | null;
}

interface Action {
  type?: ActionTypes;
  payload: {
    totalExplanationSteps?: number;
    totalValidationSteps?: number;
  };
}

const getIsComplete = (state: State) => {
  if (!state.isExplanationTotalSet || !state.isValidationTotalSet) {
    return false;
  }

  return (
    state.totalExplanationSteps < state.explanationStepsViewed ||
    state.totalValidationSteps < state.validationStepsViewed
  );
};

const getInitialState = () =>
  ({
    explanationStepsViewed: 0,
    totalExplanationSteps: 0,
    isExplanationTotalSet: false,
    validationStepsViewed: 0,
    totalValidationSteps: 0,
    isValidationTotalSet: false,
    activeSection: null,
  } as State);

const reducer: React.Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case ActionTypes.IncrementExplanation:
      return {
        ...state,
        explanationStepsViewed: state.explanationStepsViewed + 1,
        activeSection: SectionType.Explanation,
      };
    case ActionTypes.SetTotalExplanationSteps:
      if (state.isExplanationTotalSet) {
        return state;
      }
      return {
        ...state,
        totalExplanationSteps: action.payload.totalExplanationSteps || 0,
        isExplanationTotalSet: true,
      };
    case ActionTypes.IncrementValidation:
      return { ...state, validationStepsViewed: state.validationStepsViewed + 1 };
    case ActionTypes.SetTotalValidationSteps:
      if (state.isValidationTotalSet) {
        return state;
      }

      return {
        ...state,
        totalValidationSteps: action.payload.totalValidationSteps || 0,
        isValidationTotalSet: true,
      };
    case ActionTypes.SetQuestionComplete:
      return {
        ...state,
        explanationStepsViewed: state.totalExplanationSteps + 1,
        validationStepsViewed: state.totalValidationSteps + 1,
        activeSection: SectionType.Solution,
      };
    default:
      return state;
  }
};

const useLessonProgress = (
  { explanationLength, validationLength }: Props,
  initialState = getInitialState(),
) => {
  const [state, dispatch] = useReducer<React.Reducer<State, Action>>(reducer, initialState);

  useEffect(() => {
    if (explanationLength > 0) {
      dispatch({
        type: ActionTypes.SetTotalExplanationSteps,
        payload: { totalExplanationSteps: explanationLength },
      });
    }
  }, [explanationLength]);

  useEffect(() => {
    if (validationLength > 0) {
      dispatch({
        type: ActionTypes.SetTotalValidationSteps,
        payload: { totalValidationSteps: validationLength },
      });
    }
  }, [validationLength]);

  const incrementExplanationStep = () =>
    dispatch({ type: ActionTypes.IncrementExplanation, payload: {} });
  const incrementValidationStep = () =>
    dispatch({ type: ActionTypes.IncrementValidation, payload: {} });
  const setQuestionComplete = () =>
    dispatch({ type: ActionTypes.SetQuestionComplete, payload: {} });

  const isComplete = getIsComplete(state);
  const {
    explanationStepsViewed,
    validationStepsViewed,
    totalExplanationSteps,
    totalValidationSteps,
    activeSection,
  } = state;

  return {
    state,
    incrementExplanationStep,
    incrementValidationStep,
    totalExplanationSteps,
    totalValidationSteps,
    setQuestionComplete,
    explanationStepsViewed,
    validationStepsViewed,
    isComplete,
    activeSection,
    SectionType,
  };
};

export default useLessonProgress;
