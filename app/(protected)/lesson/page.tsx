"use client";

import type { NextPage } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { AnswerFeedback } from "@/features/lesson/components/answer-feedback";
import { CompletionScreen } from "@/features/lesson/components/completion-screen";
import { ExitLessonModal } from "@/features/lesson/components/exit-lesson-modal";
import { ProgressBar } from "@/features/lesson/components/progress-bar";
import { QuestionBlock } from "@/features/lesson/components/question-block";
import { LessonQuestion, LessonQuestionType } from "@/features/lesson/types/question-types";
import { useBoundStore } from "@/hooks/useBoundStore";

const QUESTIONS: LessonQuestion[] = [
  {
    id: "q1",
    type: LessonQuestionType.SELECT_1_OF_3,
    prompt: "Qual opção significa 'apple'?",
    options: [
      { id: "a", label: "Maçã" },
      { id: "b", label: "Mesa" },
      { id: "c", label: "Janela" },
    ],
    answerId: "a",
  },
  {
    id: "q2",
    type: LessonQuestionType.WRITE_IN_ENGLISH,
    prompt: "Escreva em inglês: 'bom dia'",
    answerText: "good morning",
  },
];

const LessonPage: NextPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const increaseXp = useBoundStore((store) => store.increaseXp);
  const increaseLessonsCompleted = useBoundStore((store) => store.increaseLessonsCompleted);
  const addToday = useBoundStore((store) => store.addToday);
  const increaseLingots = useBoundStore((store) => store.increaseLingots);

  const [index, setIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [writeAnswer, setWriteAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const mode = useMemo(() => {
    if (searchParams.get("practice") === "1") return "practice";
    if (searchParams.get("fast-forward") === "1") return "fast-forward";
    return "default";
  }, [searchParams]);

  const rewards = mode === "practice" ? { xp: 5, gems: 0 } : mode === "fast-forward" ? { xp: 20, gems: 10 } : { xp: 10, gems: 5 };

  const currentQuestion = QUESTIONS[index];

  const validate = () => {
    if (currentQuestion.type === LessonQuestionType.SELECT_1_OF_3) {
      return selectedOptionId === currentQuestion.answerId;
    }

    return writeAnswer.trim().toLowerCase() === currentQuestion.answerText;
  };

  const handleCheck = () => {
    const result = validate();
    setIsCorrect(result);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (!isCorrect) return;

    const isLast = index === QUESTIONS.length - 1;
    if (isLast) {
      increaseXp(rewards.xp);
      addToday(1);
      increaseLingots(rewards.gems);
      increaseLessonsCompleted(1);
      setIsCompleted(true);
      return;
    }

    setIndex((prev) => prev + 1);
    setSelectedOptionId(null);
    setWriteAnswer("");
    setShowFeedback(false);
  };

  const isCheckDisabled = currentQuestion.type === LessonQuestionType.SELECT_1_OF_3 ? !selectedOptionId : !writeAnswer.trim();

  if (isCompleted) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-2xl p-6">
        <CompletionScreen xpEarned={rewards.xp} gemsEarned={rewards.gems} onBackToLearn={() => router.push("/learn")} />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl space-y-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Lição</h1>
        <button
          type="button"
          onClick={() => setIsExitModalOpen(true)}
          aria-label="Sair da lição"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
        >
          Sair
        </button>
      </header>

      <ProgressBar current={index + 1} total={QUESTIONS.length} />
      <p className="text-sm text-zinc-600" aria-live="polite">Modo atual: {mode}</p>

      <QuestionBlock
        question={currentQuestion}
        selectedOptionId={selectedOptionId}
        writeAnswer={writeAnswer}
        onSelectOption={setSelectedOptionId}
        onWriteAnswer={setWriteAnswer}
      />

      <AnswerFeedback isCorrect={isCorrect} visible={showFeedback} />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCheck}
          disabled={isCheckDisabled}
          aria-disabled={isCheckDisabled}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Verificar
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!showFeedback || !isCorrect}
          aria-disabled={!showFeedback || !isCorrect}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Próxima
        </button>
      </div>

      <ExitLessonModal
        open={isExitModalOpen}
        onContinue={() => setIsExitModalOpen(false)}
        onExit={() => router.push("/learn")}
      />
    </main>
  );
};

export default LessonPage;
