"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import dayjs from "dayjs";
import {
  BronzeLeagueSvg,
  EmptyFireSvg,
  EmptyGemSvg,
  FireSvg,
  GemSvg,
  LessonTopBarEmptyHeart,
  LessonTopBarHeart,
  LightningProgressSvg,
  TreasureProgressSvg,
} from "./Svgs";
import { Calendar } from "./Calendar";
import { CourseImage, CourseSwitcherMenu } from "./CourseSwitcher";
import { ProBadge } from "./ProBadge";
import { useBoundStore } from "@/hooks/useBoundStore";
import { useEnrollments } from "@/hooks/use-enrollments";
import ProMascot from "@/public/duo-pro.svg";

const LESSONS_TO_UNLOCK_LEAGUES = 10;

const cardClass = "rounded-2xl border-2 border-[#37464F] p-5 text-[#DCE6EC]";

const outlineButtonClass =
  "flex w-full items-center justify-center rounded-2xl border-2 border-b-4 border-[#37464F] py-3 text-sm font-bold uppercase tracking-wide text-[#49C0F8] transition hover:bg-[#202F36] active:translate-y-0.5 active:border-b-2";

/** Item da linha de status com popover ao passar o mouse ou clicar. */
const StatItem = ({
  label,
  icon,
  value,
  valueClassName = "",
  onClose,
  align = "center",
  panelClassName = "w-[340px] p-5",
  children,
}: {
  label: string;
  icon: ReactNode;
  value?: ReactNode;
  valueClassName?: string;
  onClose?: () => void;
  /** "start" alinha o popover à esquerda do botão (usado em "Meus cursos"). */
  align?: "center" | "start";
  panelClassName?: string;
  children: ReactNode | ((close: () => void) => ReactNode);
}) => {
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={close}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className={`flex items-center gap-2 rounded-xl px-3 py-2 font-bold transition-colors hover:bg-[#202F36] ${
          open ? "bg-[#202F36]" : ""
        }`}
      >
        {icon}
        {value !== undefined && <span className={valueClassName}>{value}</span>}
      </button>
      {open && (
        // pt-2 mantém o hover ativo entre o botão e o popover.
        <div
          className={`absolute top-full z-30 pt-2 ${
            align === "start" ? "left-0" : "left-1/2 -translate-x-1/2"
          }`}
        >
          <div
            className={`overflow-hidden rounded-2xl border-2 border-[#37464F] bg-[#131F24] text-[#DCE6EC] shadow-2xl ${panelClassName}`}
          >
            {typeof children === "function" ? children(close) : children}
          </div>
        </div>
      )}
    </div>
  );
};

const StatsRow = () => {
  const streak = useBoundStore((x) => x.streak);
  const gems = useBoundStore((x) => x.gems);
  const hearts = useBoundStore((x) => x.hearts);
  const activeDays = useBoundStore((x) => x.activeDays);
  const { activeEnrollment } = useEnrollments();

  const [now, setNow] = useState(dayjs());
  const practicedToday = activeDays.includes(dayjs().format("YYYY-MM-DD"));

  return (
    <article className="flex items-center justify-between gap-2">
      <StatItem
        label="Meus cursos"
        icon={<CourseImage course={activeEnrollment} />}
        value={activeEnrollment?.coursePoints}
        valueClassName="text-[#58CC02]"
        align="start"
        panelClassName="w-64"
      >
        {(close) => <CourseSwitcherMenu onSelect={close} />}
      </StatItem>

      <StatItem
        label="Ofensiva"
        icon={
          <span className="pointer-events-none">
            {practicedToday ? <FireSvg /> : <EmptyFireSvg className="opacity-40" />}
          </span>
        }
        value={streak}
        valueClassName={practicedToday ? "text-[#FF9600]" : "text-[#52656D]"}
        onClose={() => setNow(dayjs())}
      >
        <h2 className="text-center text-lg font-bold text-white">
          Ofensiva de {streak} {streak === 1 ? "dia" : "dias"}
        </h2>
        <p className="mb-4 mt-1 text-center text-sm text-[#9DB1BB]">
          {practicedToday
            ? "Você já praticou hoje. Continue amanhã!"
            : "Faça uma lição hoje para manter sua ofensiva!"}
        </p>
        <Calendar now={now} setNow={setNow} />
      </StatItem>

      <StatItem
        label="Gemas"
        icon={gems > 0 ? <GemSvg /> : <EmptyGemSvg className="opacity-40" />}
        value={gems}
        valueClassName={gems > 0 ? "text-[#FF4B4B]" : "text-[#52656D]"}
      >
        <h2 className="text-lg font-bold text-white">Gemas</h2>
        <p className="mt-1 text-sm text-[#9DB1BB]">
          Você tem {gems} {gems === 1 ? "gema" : "gemas"}.
        </p>
        <Link
          href="/shop"
          className="mt-3 inline-block text-sm font-bold uppercase tracking-wide text-[#49C0F8] hover:brightness-110"
        >
          Ir para a loja
        </Link>
      </StatItem>

      <StatItem
        label="Vidas"
        icon={hearts > 0 ? <LessonTopBarHeart /> : <LessonTopBarEmptyHeart />}
        value={hearts}
        valueClassName={hearts > 0 ? "text-[#FF4B4B]" : "text-[#52656D]"}
      >
        <h2 className="text-lg font-bold text-white">Vidas</h2>
        <p className="mt-1 text-sm text-[#9DB1BB]">
          {hearts > 0
            ? `Você tem ${hearts} ${hearts === 1 ? "vida" : "vidas"}. Cada erro custa uma.`
            : "Suas vidas acabaram. Recarregue na loja para continuar."}
        </p>
        <Link
          href="/shop"
          className="mt-3 inline-block text-sm font-bold uppercase tracking-wide text-[#49C0F8] hover:brightness-110"
        >
          Recarregar vidas
        </Link>
      </StatItem>
    </article>
  );
};

const ProPromoSection = () => (
  <article className={`${cardClass} relative overflow-hidden`}>
    <Image
      src={ProMascot}
      alt=""
      className="pointer-events-none absolute -right-2 -top-2 h-28 w-auto"
    />
    <ProBadge />
    <h2 className="mt-3 max-w-[60%] text-lg font-bold text-white">
      Experimente o Pro de graça
    </h2>
    <p className="mt-2 max-w-[70%] text-[15px] leading-6">
      Zero anúncios, prática personalizada e vidas ilimitadas!
    </p>
    <Link
      href="/shop"
      className="mt-5 flex w-full items-center justify-center rounded-2xl border-b-4 border-[#3B3BCC] bg-[#5555FF] py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:brightness-110 active:translate-y-0.5 active:border-b-2"
    >
      Começar mês grátis
    </Link>
  </article>
);

const LeaguesSection = () => {
  const lessonsCompleted = useBoundStore((x) => x.lessonsCompleted);
  const xpThisWeek = useBoundStore((x) => x.xpThisWeek());
  const locked = lessonsCompleted < LESSONS_TO_UNLOCK_LEAGUES;
  const lessonsLeft = LESSONS_TO_UNLOCK_LEAGUES - lessonsCompleted;

  return (
    <article className={cardClass}>
      <p className="text-sm font-bold uppercase tracking-wide text-[#52656D]">Ligas</p>
      <div className="mt-2 flex items-start gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">
            {locked ? "Desbloqueie as ligas!" : "Liga Bronze"}
          </h2>
          <p className="mt-2 text-[15px] leading-6">
            {locked
              ? `Complete mais ${lessonsLeft} ${lessonsLeft === 1 ? "lição" : "lições"} para começar a competir.`
              : `Você ganhou ${xpThisWeek} XP esta semana até agora.`}
          </p>
        </div>
        {locked ? <LockedLeaderboardsSvg /> : <BronzeLeagueSvg />}
      </div>
      <Link href="/leaderboard" className={`${outlineButtonClass} mt-5`}>
        Ver ligas
      </Link>
    </article>
  );
};

const StopwatchSvg = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
    <rect x="20" y="4" width="8" height="6" rx="2" fill="#1899D6" />
    <circle cx="24" cy="27" r="17" fill="#1CB0F6" />
    <circle cx="24" cy="27" r="12.5" fill="white" />
    <path d="M24 27V19" stroke="#1CB0F6" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="24" cy="27" r="2.5" fill="#1CB0F6" />
  </svg>
);

const ComboSvg = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
    <circle cx="24" cy="24" r="20" fill="#58CC02" />
    <circle cx="24" cy="24" r="13" fill="white" />
    <circle cx="24" cy="24" r="7" fill="#58CC02" />
    <path d="M24 24 40 8" stroke="#FF4B4B" strokeWidth="4" strokeLinecap="round" />
    <path d="M36 6h6v6" stroke="#FF4B4B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type Chest = "bronze" | "silver" | "gold";

/** O baú dourado recolorido por filtro CSS para bronze e prata. */
const CHEST_FILTER: Record<Chest, string> = {
  bronze: "sepia saturate-150 hue-rotate-[-15deg] brightness-90",
  silver: "grayscale brightness-125",
  gold: "",
};

const QuestRow = ({
  icon,
  title,
  current,
  goal,
  chest,
}: {
  icon: ReactNode;
  title: string;
  current: number;
  goal: number;
  chest: Chest;
}) => {
  const clamped = Math.min(current, goal);
  const done = clamped >= goal;

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center">{icon}</div>
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="font-bold leading-snug text-white">{title}</h3>
        <div className="flex items-center gap-1">
          <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-[#37464F]">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${
                done ? "bg-[#58CC02]" : "bg-[#FFC800]"
              }`}
              style={{ width: `${(clamped / goal) * 100}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#DCE6EC]">
              {clamped} / {goal}
            </span>
          </div>
          <span className={`-ml-3 scale-75 ${CHEST_FILTER[chest]}`}>
            <TreasureProgressSvg />
          </span>
        </div>
      </div>
    </div>
  );
};

const COMBO_LESSONS_GOAL = 3;
const STUDY_MINUTES_GOAL = 5;

const DailyQuestsSection = () => {
  const xpToday = useBoundStore((x) => x.xpToday());
  const goalXp = useBoundStore((x) => x.goalXp);
  const minutesToday = useBoundStore((x) => x.minutesToday());
  const comboLessonsToday = useBoundStore((x) => x.comboLessonsToday());

  return (
    <article className={cardClass}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Missões do dia</h2>
        <Link
          href="/quests"
          className="text-sm font-bold uppercase tracking-wide text-[#49C0F8] hover:brightness-110"
        >
          Ver todas
        </Link>
      </div>
      <div className="mt-5 flex flex-col gap-6">
        <QuestRow
          icon={<LightningProgressSvg size={48} />}
          title={`Ganhe ${goalXp} XP`}
          current={xpToday}
          goal={goalXp}
          chest="bronze"
        />
        <QuestRow
          icon={<StopwatchSvg />}
          title={`Estude por ${STUDY_MINUTES_GOAL} minutos`}
          current={minutesToday}
          goal={STUDY_MINUTES_GOAL}
          chest="silver"
        />
        <QuestRow
          icon={<ComboSvg />}
          title={`Acerte 5 exercícios seguidos em ${COMBO_LESSONS_GOAL} lições`}
          current={comboLessonsToday}
          goal={COMBO_LESSONS_GOAL}
          chest="gold"
        />
      </div>
    </article>
  );
};

const FOOTER_LINKS = [
  { label: "Sobre", href: "/" },
  { label: "Blog", href: "#" },
  { label: "Loja", href: "/shop" },
  { label: "Eficácia", href: "#" },
  { label: "Carreiras", href: "#" },
  { label: "Investidores", href: "#" },
  { label: "Termos de uso", href: "#" },
  { label: "Privacidade", href: "#" },
];

const RightBarFooter = () => (
  <footer className="px-4 pb-6">
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
      {FOOTER_LINKS.map((link) => (
        <li key={link.label}>
          <Link
            href={link.href}
            className="text-xs font-bold uppercase tracking-wide text-[#52656D] transition-colors hover:text-[#DCE6EC]"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </footer>
);

const STICKY_GAP = 24;

/**
 * Se a barra for mais alta que a tela, gruda pela base (top negativo)
 * para que o rodapé continue alcançável.
 */
const useStickyTop = () => {
  const ref = useRef<HTMLElement | null>(null);
  const [top, setTop] = useState(STICKY_GAP);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () =>
      setTop(Math.min(STICKY_GAP, window.innerHeight - element.offsetHeight - STICKY_GAP));

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return { ref, top };
};

export const RightBar = () => {
  const { ref, top } = useStickyTop();

  return (
    <aside
      ref={ref}
      style={{ top }}
      className="sticky hidden w-[368px] shrink-0 flex-col gap-5 self-start lg:flex"
    >
      <StatsRow />
      <ProPromoSection />
      <LeaguesSection />
      <DailyQuestsSection />
      <RightBarFooter />
    </aside>
  );
};

const LockedLeaderboardsSvg = () => {
  return (
    <svg width="40" height="46" viewBox="0 0 40 46" fill="none">
      <path
        d="M6.82875 3.41476L33.1701 3.41476C36.9418 3.41476 39.9993 6.47231 39.9993 10.244V26.3415C39.9993 36.8483 31.4819 45.3658 20.975 45.3658H19.0238C8.51698 45.3658 -0.000488281 36.8483 -0.000488281 26.3415L-0.000488281 10.244C-0.000488281 6.47231 3.05707 3.41476 6.82875 3.41476Z"
        fill="#AAC1D4"
      />
      <path
        d="M23.544 3.41476L33.1698 3.41476C36.9415 3.41476 39.9991 6.47231 39.9991 10.244V14.554L10.9707 43.5824C4.66224 40.6308 0.240328 34.3187 0.00878906 26.95L23.544 3.41476Z"
        fill="#C2D1DD"
      />
      <path
        d="M6.82875 -1.52588e-05L33.1701 -1.52588e-05C36.9418 -1.52588e-05 39.9993 3.05754 39.9993 6.82922V23.9023C39.9993 33.8703 31.9187 41.951 21.9506 41.951H18.0482C8.08019 41.951 -0.000488281 33.8703 -0.000488281 23.9023L-0.000488281 6.82922C-0.000488281 3.05754 3.05707 -1.52588e-05 6.82875 -1.52588e-05Z"
        fill="#C2D1DD"
      />
      <path
        d="M6.82875 4.39021C5.48172 4.39021 4.38974 5.48219 4.38974 6.82922L4.38974 23.9023C4.38974 31.4457 10.5048 37.5608 18.0482 37.5608H21.9506C29.494 37.5608 35.6091 31.4457 35.6091 23.9023V6.82922C35.6091 5.48219 34.5171 4.39021 33.1701 4.39021L6.82875 4.39021ZM6.82875 -1.52588e-05L33.1701 -1.52588e-05C36.9418 -1.52588e-05 39.9993 3.05754 39.9993 6.82922V23.9023C39.9993 33.8703 31.9187 41.951 21.9506 41.951H18.0482C8.08019 41.951 -0.000488281 33.8703 -0.000488281 23.9023L-0.000488281 6.82922C-0.000488281 3.05754 3.05707 -1.52588e-05 6.82875 -1.52588e-05Z"
        fill="#D6E4EF"
      />
      <path
        d="M26.9597 -1.52588e-05L33.1709 -1.52588e-05C36.9426 -1.52588e-05 40.0002 3.05754 40.0002 6.82922V14.5539L13.2484 41.3056C6.49782 39.4476 1.33102 33.7672 0.221802 26.7379L26.9597 -1.52588e-05Z"
        fill="#D1DCE5"
      />
      <path
        d="M4.39056 22.5692V23.9023C4.39056 31.1031 9.96287 37.0024 17.0306 37.5234L13.2484 41.3056C6.49782 39.4476 1.33102 33.7672 0.221802 26.7379L4.39056 22.5692ZM35.6099 18.9441V6.82922C35.6099 5.48219 34.518 4.39021 33.1709 4.39021L22.5695 4.39021L26.9597 -1.52588e-05L33.1709 -1.52588e-05C36.9426 -1.52588e-05 40.0002 3.05754 40.0002 6.82922V14.5539L35.6099 18.9441Z"
        fill="#E0EAF3"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.0277 22.1682C15.8255 21.312 15.0474 19.9455 15.0474 18.4059C15.0474 15.813 17.2544 13.7111 19.9769 13.7111C22.6994 13.7111 24.9064 15.813 24.9064 18.4059C24.9064 19.9765 24.0966 21.3669 22.853 22.2192L24.1155 25.5237C24.4553 26.4131 23.9457 27.3871 22.9772 27.6992C22.7794 27.7629 22.5714 27.7954 22.3619 27.7954H17.4994C16.473 27.7954 15.6409 27.0313 15.6409 26.0887C15.6409 25.8963 15.6764 25.7053 15.7458 25.5237L17.0277 22.1682Z"
        fill="#8097AA"
      />
    </svg>
  );
};
