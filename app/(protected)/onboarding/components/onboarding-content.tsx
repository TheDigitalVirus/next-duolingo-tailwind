"use client";

import Questionnaire from "@/components/questionnaire";
import { useQuestionnaire } from "@/hooks/useQuestionnaire";

export function OnboardingContent() {
  const {
    showQuestionnaire,
    courseLevel,
    selectedCourse,
    handleQuestionnaireComplete,
  } = useQuestionnaire();


  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-green-50 to-white p-4">
      {showQuestionnaire ? (
        <Questionnaire
          onComplete={handleQuestionnaireComplete}
          selectedCourse={
            selectedCourse
              ? {
                  id: Number(selectedCourse.id),
                  title: selectedCourse.title,
                }
              : null
          }
        />
      ) : (
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">
            Parabéns! Seu curso está pronto 🎉
          </h1>

          {selectedCourse && (
            <div className="mb-4 rounded-xl bg-green-50 p-4">
              <h3 className="font-semibold text-gray-800">Curso Selecionado</h3>
              <p className="font-bold text-green-600">{selectedCourse.title}</p>
            </div>
          )}

          {courseLevel && (
            <div className="mb-6 space-y-4">
              <div className="rounded-xl bg-green-50 p-4">
                <h3 className="font-semibold text-gray-800">Nível do Curso</h3>
                <p className="capitalize text-green-600">{courseLevel.level}</p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <h3 className="font-semibold text-gray-800">Intensidade</h3>
                <p className="capitalize text-blue-600">
                  {courseLevel.intensity}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-4">
                <h3 className="font-semibold text-gray-800">Foco Principal</h3>
                <p className="capitalize text-purple-600">
                  {courseLevel.focus}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => (window.location.href = "/learn")}
            className="w-full rounded-xl bg-green-500 py-4 font-bold text-white transition-colors hover:bg-green-600"
          >
            Começar a Aprender {selectedCourse?.title}
          </button>
        </div>
      )}
    </div>
  );
}
