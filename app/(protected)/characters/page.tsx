"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useBoundStore } from "@/hooks/useBoundStore";
import { useEnrollments } from "@/hooks/use-enrollments";
import {
  getSoundCourse,
  SOUND_PRACTICE_GOAL,
  type SoundItem,
} from "@/utils/characters";

/** Fala o texto com a voz do navegador (Web Speech API). */
const useSpeech = (lang: string) => {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  // Começa `true` para o HTML do servidor e do cliente baterem; checa após montar.
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const available = "speechSynthesis" in window;
    setSupported(available);
    return () => {
      if (available) window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (id: string, text: string) => {
      if (!supported) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      utterance.onend = () => setSpeakingId((current) => (current === id ? null : current));
      utterance.onerror = utterance.onend;
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    },
    [lang, supported],
  );

  return { speak, speakingId, supported };
};

const SectionDivider = ({ title }: { title: string }) => (
  <div className="flex items-center gap-4 py-6" role="separator">
    <div className="h-0.5 flex-1 bg-[#37464F]" />
    <h2 className="text-lg font-bold text-white">{title}</h2>
    <div className="h-0.5 flex-1 bg-[#37464F]" />
  </div>
);

const SoundCard = ({
  item,
  practiced,
  speaking,
  onPlay,
}: {
  item: SoundItem;
  practiced: number;
  speaking: boolean;
  onPlay: () => void;
}) => {
  const progress = Math.min(1, practiced / SOUND_PRACTICE_GOAL);

  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Ouvir ${item.symbol}, como em ${item.example}`}
      className={`flex flex-col items-center rounded-2xl border-2 border-b-4 px-2 pb-2.5 pt-2 transition hover:bg-[#202F36] active:translate-y-0.5 active:border-b-2 ${
        speaking ? "border-[#3F85A7] bg-[#202F36]" : "border-[#37464F]"
      }`}
    >
      <span className="text-lg font-bold leading-6 text-white">{item.symbol}</span>
      <span className="text-sm text-[#52656D]">{item.example}</span>
      <span className="mt-1.5 h-2 w-10 overflow-hidden rounded-full bg-[#37464F]">
        <span
          className="block h-full rounded-full bg-[#FFC800] transition-[width] duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </span>
    </button>
  );
};

const CharactersPage = () => {
  const { activeEnrollment } = useEnrollments();
  const course = getSoundCourse(activeEnrollment?.language);
  const soundPractice = useBoundStore((x) => x.soundPractice);
  const practiceSound = useBoundStore((x) => x.practiceSound);
  const { speak, speakingId, supported } = useSpeech(course.speechLang);

  const play = (item: SoundItem) => {
    speak(item.id, item.speak);
    practiceSound(item.id);
  };

  return (
    <main className="mx-auto w-full max-w-[520px] pb-32 pt-4 lg:pt-10">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-white sm:text-[28px]">{course.title}</h1>
        <p className="mt-3 text-[#DCE6EC]">{course.subtitle}</p>
        <Link
          href="/lesson?practice=1"
          className="mx-auto mt-6 flex w-full max-w-[330px] items-center justify-center rounded-2xl border-b-4 border-[#1899D6] bg-[#49C0F8] py-3.5 text-sm font-bold uppercase tracking-wide text-[#131F24] transition hover:brightness-110 active:translate-y-0.5 active:border-b-2"
        >
          Começar +10 XP
        </Link>
        {!supported && (
          <p className="mt-3 text-sm text-[#FF9600]">
            Seu navegador não suporta áudio por síntese de voz.
          </p>
        )}
      </header>

      {course.sections.map((section) => (
        <section key={section.id}>
          <SectionDivider title={section.title} />
          <div className="grid grid-cols-3 gap-2">
            {section.items.map((item) => (
              <SoundCard
                key={item.id}
                item={item}
                practiced={soundPractice[item.id] ?? 0}
                speaking={speakingId === item.id}
                onPlay={() => play(item)}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
};

export default CharactersPage;
