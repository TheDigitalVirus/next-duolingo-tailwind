import { LessonQuestion, LessonQuestionType } from "@/features/lesson/types/question-types";

interface QuestionBlockProps {
  question: LessonQuestion;
  selectedOptionId: string | null;
  writeAnswer: string;
  disabled?: boolean;
  onSelectOption: (optionId: string) => void;
  onWriteAnswer: (value: string) => void;
}

export const QuestionBlock = ({
  question,
  selectedOptionId,
  writeAnswer,
  disabled = false,
  onSelectOption,
  onWriteAnswer,
}: QuestionBlockProps) => {
  if (question.type === LessonQuestionType.SELECT_1_OF_3) {
    return (
      <section aria-labelledby={`question-${question.id}`}>
        <h2 className="text-xl font-semibold" id={`question-${question.id}`}>{question.prompt}</h2>
        <div className="mt-4 grid gap-3" role="radiogroup" aria-label="Escolha uma opção">
          {question.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Opção ${option.label}`}
                disabled={disabled}
                onClick={() => onSelectOption(option.id)}
                className={`rounded-lg border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isSelected ? "border-emerald-500 bg-emerald-50" : "border-zinc-300"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby={`question-${question.id}`}>
      <h2 className="text-xl font-semibold" id={`question-${question.id}`}>{question.prompt}</h2>
      <label htmlFor={`input-${question.id}`} className="mt-4 block text-sm text-zinc-600">Resposta em inglês</label>
      <input
        id={`input-${question.id}`}
        type="text"
        aria-label="Digite a resposta em inglês"
        value={writeAnswer}
        disabled={disabled}
        onChange={(event) => onWriteAnswer(event.target.value)}
        className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </section>
  );
};
