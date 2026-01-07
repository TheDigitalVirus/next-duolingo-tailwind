// components/questionnaire.tsx
"use client";

import { siteConfig } from "@/config/site";
import { useState, useEffect } from "react";

interface QuestionnaireProps {
  onComplete: (answers: QuestionnaireAnswers) => void;
  selectedCourse?: {
    id: number;
    title: string;
  } | null;
}

export interface QuestionnaireAnswers {
  discoverySource: string;
  learningGoal: string;
  languageLevel: string;
  dailyGoal: string;
}

export default function Questionnaire({
  onComplete,
  selectedCourse,
}: QuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    discoverySource: "",
    learningGoal: "",
    languageLevel: "",
    dailyGoal: "",
  });

  // Obter o nome do curso ou usar padrão
  const courseName = selectedCourse?.title || "inglês";

  const steps = [
    {
      title: `Como você soube do ${siteConfig.applicationName}?`,
      options: [
        "YouTube",
        "LinkedIn",
        "TV",
        "Busca do Google",
        "WhatsApp",
        "Facebook ou Instagram",
        "Amigos ou família",
        "TikTok",
        "Notícia, artigo ou blog",
        "Outros",
      ],
      key: "discoverySource" as keyof QuestionnaireAnswers,
    },
    {
      title: `Você quer aprender ${courseName} para...`,
      options: [
        "Usar bem o tempo",
        "Avançar na educação",
        "Viajar",
        "Outro",
        "Progredir na carreira",
        "Interagir com pessoas",
        "Me divertir",
      ],
      key: "learningGoal" as keyof QuestionnaireAnswers,
    },
    {
      title: `Quanto você entende de ${courseName}?`,
      options: [
        `Não sei nada de ${courseName}`,
        `Conheço algumas palavras em ${courseName}`,
        `Consigo ter conversas simples em ${courseName}`,
        `Consigo falar de assuntos variados em ${courseName}`,
        `Consigo falar sobre a maioria dos assuntos em ${courseName} em detalhes`,
      ],
      key: "languageLevel" as keyof QuestionnaireAnswers,
    },
    {
      title: "Qual vai ser a sua meta diária?",
      options: [
        "5 min / dia    Casual",
        "10 min / dia    Regular",
        "15 min / dia    Intensa",
        "20 min / dia    Puxada",
      ],
      key: "dailyGoal" as keyof QuestionnaireAnswers,
    },
  ];

  const splitIntoColumns = (options: string[], columns = 2) => {
    if (!options || options.length === 0) return [[], []];
    const mid = Math.ceil(options.length / columns);
    return [options.slice(0, mid), options.slice(mid)];
  };

  const handleAnswer = (answer: string) => {
    if (currentStep >= steps.length) {
      onComplete(answers);
      return;
    }

    const currentStepKey = steps[currentStep].key;
    const newAnswers = { ...answers, [currentStepKey]: answer };
    setAnswers(newAnswers);

    // Special handling for "Me divertir" goal
    if (currentStepKey === "learningGoal" && answer === "Me divertir") {
      setTimeout(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          onComplete(newAnswers);
        }
      }, 500);
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    if (currentStep >= steps.length) {
      onComplete(answers);
    }
  }, [currentStep, answers, onComplete, steps.length]);

  if (currentStep >= steps.length) {
    return null;
  }

  const currentStepData = steps[currentStep];

  // Special screen for "Me divertir" selection
  if (currentStep === 1 && answers.learningGoal === "Me divertir") {
    const filteredOptions = steps[1].options.filter(
      (opt) => opt !== "Me divertir"
    );
    const [leftColumn, rightColumn] = splitIntoColumns(filteredOptions);

    return (
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          🎉 A diversão é a minha especialidade!
        </h1>
        <p className="mb-6 text-center text-gray-600">
          Vamos tornar seu aprendizado de {courseName} divertido e envolvente!
        </p>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-3">
            {leftColumn.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="w-full rounded-xl border border-gray-200 p-4 text-left transition-all duration-200 hover:border-green-300 hover:bg-green-50 hover:shadow-md"
              >
                {option}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {rightColumn.map((option, index) => (
              <button
                key={index + leftColumn.length}
                onClick={() => handleAnswer(option)}
                className="w-full rounded-xl border border-gray-200 p-4 text-left transition-all duration-200 hover:border-green-300 hover:bg-green-50 hover:shadow-md"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <button
            onClick={() => handleAnswer("Me divertir")}
            className="w-full rounded-xl border-2 border-green-400 bg-green-100 p-4 text-left font-semibold text-green-800 transition-all duration-200 hover:bg-green-200 hover:shadow-md"
          >
            <span className="flex items-center justify-between">
              Me divertir
              <span className="text-xl">🎯</span>
            </span>
          </button>
        </div>

        <button
          onClick={goBack}
          className="mt-6 w-full rounded-lg p-3 text-center text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
        >
          ← Voltar
        </button>
      </div>
    );
  }
  console.log(answers);

  // Benefits screen after language level selection
  if (currentStep === 2 && answers.languageLevel) {
    return (
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          🚀 Veja o que você vai conseguir fazer com {courseName}!
        </h1>

        <div className="mb-8 space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500">
              <span className="font-bold text-white">✓</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Falar com confiança</h3>
              <p className="text-sm text-gray-600">
                Exercícios de fala e escuta sem complicação
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500">
              <span className="font-bold text-white">✓</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Adquirir vocabulário</h3>
              <p className="text-sm text-gray-600">
                Palavras e expressões comuns em {courseName}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500">
              <span className="font-bold text-white">✓</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">
                Criar o hábito de aprender
              </h3>
              <p className="text-sm text-gray-600">
                Lembretes inteligentes, desafios divertidos e muito mais
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentStep(3)}
          className="w-full rounded-xl bg-green-500 py-4 font-bold text-white transition-all duration-200 hover:bg-green-600 hover:shadow-lg"
        >
          Continuar para a Meta Diária
        </button>
      </div>
    );
  }

  // Renderização normal dos steps
  const [leftColumn, rightColumn] = splitIntoColumns(currentStepData.options);

  return (
    <div className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-lg">
      {/* Header com curso selecionado */}
      {selectedCourse && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-center">
          <p className="text-sm text-blue-800">
            Curso selecionado:{" "}
            <span className="font-bold">{selectedCourse.title}</span>
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm text-gray-600">
          <span>Progresso</span>
          <span>
            {currentStep + 1} de {steps.length}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <h1 className="mb-8 text-center text-2xl font-bold text-gray-800">
        {currentStepData.title}
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-gray-800">
        <div className="space-y-3">
          {leftColumn.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="w-full rounded-xl border border-gray-200 p-4 text-left transition-all duration-200 hover:border-green-300 hover:bg-green-50 hover:shadow-md"
            >
              {option}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {rightColumn.map((option, index) => (
            <button
              key={index + leftColumn.length}
              onClick={() => handleAnswer(option)}
              className="w-full rounded-xl border border-gray-200 p-4 text-left transition-all duration-200 hover:border-green-300 hover:bg-green-50 hover:shadow-md"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {currentStep > 0 && (
        <button
          onClick={goBack}
          className="mt-6 w-full rounded-lg p-3 text-center text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
        >
          ← Voltar
        </button>
      )}
    </div>
  );
}
