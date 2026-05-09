export enum LessonQuestionType {
  SELECT_1_OF_3 = "SELECT_1_OF_3",
  WRITE_IN_ENGLISH = "WRITE_IN_ENGLISH",
}

export interface LessonQuestionOption {
  id: string;
  label: string;
}

export interface BaseLessonQuestion {
  id: string;
  prompt: string;
  type: LessonQuestionType;
}

export interface SelectOneOfThreeQuestion extends BaseLessonQuestion {
  type: LessonQuestionType.SELECT_1_OF_3;
  options: LessonQuestionOption[];
  answerId: string;
}

export interface WriteInEnglishQuestion extends BaseLessonQuestion {
  type: LessonQuestionType.WRITE_IN_ENGLISH;
  answerText: string;
}

export type LessonQuestion = SelectOneOfThreeQuestion | WriteInEnglishQuestion;
