interface AnswerFeedbackProps {
  isCorrect: boolean;
  visible: boolean;
}

export const AnswerFeedback = ({ isCorrect, visible }: AnswerFeedbackProps) => {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-lg px-4 py-3 text-sm font-medium ${isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}
    >
      {isCorrect ? "Boa! Resposta correta." : "Ops! Resposta incorreta."}
    </div>
  );
};
