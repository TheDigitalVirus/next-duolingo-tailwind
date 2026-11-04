"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, Headphones, RefreshCw, Sparkles } from "lucide-react";
import { ProBadge } from "@/components/ProBadge";
import { useBoundStore } from "@/hooks/useBoundStore";
import { getCurrentUnit } from "@/utils/units";
import DuoAcademic from "@/public/duo-academic.svg";

/** Para onde vão os recursos Pro enquanto o usuário não assina. */
const PRO_UPSELL_HREF = "/shop";
const PRACTICE_LESSON_HREF = "/lesson?practice=1";

const formatBadge = (count: number) => (count > 30 ? "30+" : String(count));

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-4 mt-10 text-2xl font-bold text-white">{children}</h2>
);

const PracticeCard = ({
  title,
  description,
  href,
  pro = false,
  badge,
  art,
}: {
  title: string;
  description: string;
  href: string;
  pro?: boolean;
  badge?: string | null;
  art: ReactNode;
}) => (
  <Link
    href={href}
    className="relative flex min-h-[104px] items-center rounded-2xl border-2 border-b-4 border-[#37464F] p-5 pr-32 transition hover:bg-[#202F36] active:translate-y-0.5 active:border-b-2"
  >
    {/* A arte "vaza" pela borda direita, então fica num container recortado. */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
      <div className="absolute -bottom-3 -right-3">{art}</div>
    </div>

    <div className="relative">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {pro && <ProBadge className="text-xs" />}
      </div>
      <p className="mt-1.5 text-sm font-bold text-[#DCE6EC]">{description}</p>
    </div>

    {badge && (
      <span className="absolute -top-3 right-2 rounded-full border-2 border-[#131F24] bg-[#FF4B4B] px-2 py-0.5 text-xs font-bold text-white">
        {badge}
      </span>
    )}
  </Link>
);

const ListeningArt = () => (
  <Headphones className="h-24 w-24 rotate-12 text-[#FF4B4B]" strokeWidth={2.5} />
);

const MistakesArt = () => (
  <div className="flex h-24 w-24 items-center justify-center rounded-full border-8 border-[#37464F] bg-[#FF9600]">
    <RefreshCw className="h-11 w-11 text-white" strokeWidth={3} />
  </div>
);

const WordsArt = () => (
  <div className="relative h-24 w-24">
    <div className="absolute bottom-0 right-0 h-20 w-16 rotate-12 rounded-xl bg-[#1899D6]" />
    <div className="absolute bottom-2 right-6 flex h-20 w-16 -rotate-6 items-center justify-center rounded-xl bg-[#49C0F8]">
      <Sparkles className="h-8 w-8 fill-[#1899D6] text-[#1899D6]" />
    </div>
  </div>
);

const StoriesArt = () => (
  <BookOpen className="h-24 w-24 -rotate-6 fill-[#E5B8FF] text-[#CE82FF]" strokeWidth={2} />
);

const PracticePage = () => {
  const lessonsCompleted = useBoundStore((x) => x.lessonsCompleted);
  const mistakes = useBoundStore((x) => x.mistakes);

  const currentUnit = getCurrentUnit(lessonsCompleted);
  // Revisa a unidade anterior; no começo do curso, a própria unidade atual.
  const reviewUnitNumber = Math.max(1, currentUnit.unitNumber - 1);

  return (
    <main className="mx-auto w-full max-w-[540px] pb-32 pt-2 lg:pt-6">
      <h2 className="mb-4 text-2xl font-bold text-white">Revisão de hoje</h2>
      <article className="relative min-h-[270px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#0E4D7A] via-[#1F2A6E] to-[#4A2477] p-6">
        <Image
          src={DuoAcademic}
          alt=""
          className="pointer-events-none absolute -bottom-2 -right-4 h-52 w-auto"
        />
        <div className="relative max-w-[62%]">
          <ProBadge />
          <h3 className="mt-3 text-2xl font-bold text-white">Relembre a unidade</h3>
          <p className="mt-2 font-bold text-white/90">
            Revise a unidade {reviewUnitNumber} pra refrescar a memória!
          </p>
        </div>
        <Link
          href={PRO_UPSELL_HREF}
          className="absolute bottom-6 left-6 rounded-xl border-b-4 border-[#C9C1E8] bg-white px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#5B33B8] transition hover:brightness-95 active:translate-y-0.5 active:border-b-2"
        >
          Desbloquear
        </Link>
      </article>

      <SectionTitle>Conversação</SectionTitle>
      <PracticeCard
        title="Escuta"
        description="Treine os ouvidos com uma sessão só de áudio."
        href={PRO_UPSELL_HREF}
        pro
        art={<ListeningArt />}
      />

      <SectionTitle>Suas coleções</SectionTitle>
      <div className="flex flex-col gap-4">
        <PracticeCard
          title="Erros"
          description="Faça uma lição personalizada e revise os seus erros."
          href={PRO_UPSELL_HREF}
          pro
          badge={mistakes > 0 ? formatBadge(mistakes) : null}
          art={<MistakesArt />}
        />
        <PracticeCard
          title="Palavras"
          description="Revise o seu vocabulário quando quiser."
          href={PRO_UPSELL_HREF}
          pro
          art={<WordsArt />}
        />
        <PracticeCard
          title="Histórias"
          description="Releia uma história pra revisar palavras em contexto."
          href={PRACTICE_LESSON_HREF}
          art={<StoriesArt />}
        />
      </div>
    </main>
  );
};

export default PracticePage;
