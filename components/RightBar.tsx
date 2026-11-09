"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import dayjs from "dayjs";
import {
  EmptyFireSvg,
  EmptyGemSvg,
  FireSvg,
  GemSvg,
  LessonTopBarEmptyHeart,
  LessonTopBarHeart,
} from "./Svgs";
import { Calendar } from "./Calendar";
import { CourseImage, CourseSwitcherMenu } from "./CourseSwitcher";
import { DailyQuestList, useQuestHistory } from "./DailyQuests";
import { LeagueBadge } from "./LeagueBadge";
import { ProBadge } from "./ProBadge";
import { UserAvatar } from "./UserAvatar";
import { LESSONS_TO_UNLOCK_LEAGUES, useBoundStore } from "@/hooks/useBoundStore";
import { useEnrollments } from "@/hooks/use-enrollments";
import { getEarnedMonthlyMedals, monthName, MONTHLY_QUESTS_GOAL } from "@/utils/daily-quests";
import { LEAGUES } from "@/utils/leagues";
import ProMascot from "@/public/duo-pro.svg";

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
  const leagueIndex = useBoundStore((x) => x.leagueIndex);
  const xpThisWeek = useBoundStore((x) => x.xpThisWeek());
  const locked = lessonsCompleted < LESSONS_TO_UNLOCK_LEAGUES;
  const lessonsLeft = LESSONS_TO_UNLOCK_LEAGUES - lessonsCompleted;
  const league = LEAGUES[leagueIndex] ?? LEAGUES[0];

  return (
    <article className={cardClass}>
      <p className="text-sm font-bold uppercase tracking-wide text-[#52656D]">Ligas</p>
      <div className="mt-2 flex items-start gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">
            {locked ? "Desbloqueie as ligas!" : `Divisão ${league.name}`}
          </h2>
          <p className="mt-2 text-[15px] leading-6">
            {locked
              ? `Complete mais ${lessonsLeft} ${lessonsLeft === 1 ? "lição" : "lições"} para começar a competir.`
              : `Você ganhou ${xpThisWeek} XP esta semana até agora.`}
          </p>
        </div>
        {locked ? <LockedLeaderboardsSvg /> : <LeagueBadge league={league} size={64} />}
      </div>
      <Link href="/leaderboard" className={`${outlineButtonClass} mt-5`}>
        Ver ligas
      </Link>
    </article>
  );
};

const DailyQuestsSection = () => (
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
    <div className="mt-5">
      <DailyQuestList />
    </div>
  </article>
);

/** Medalhas das missões mensais concluídas (lado direito da página Missões). */
const MedalsSection = () => {
  const history = useQuestHistory();
  const medals = getEarnedMonthlyMedals(history);

  return (
    <article className={cardClass}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Medalhas</h2>
        <Link
          href="/profile"
          className="text-sm font-bold uppercase tracking-wide text-[#49C0F8] hover:brightness-110"
        >
          Ver todas
        </Link>
      </div>

      {medals.length === 0 ? (
        <div className="mt-5 flex items-center gap-4">
          <MonthMedal label="?" muted />
          <p className="text-[15px] leading-6">
            Complete {MONTHLY_QUESTS_GOAL} missões em um mês para ganhar sua primeira medalha.
          </p>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-5">
          {medals.map((month) => (
            <li key={month.format("YYYY-MM")} className="flex items-center gap-4">
              <MonthMedal label={monthName(month).slice(0, 3)} />
              <div>
                <p className="font-bold text-white">Missão de {monthName(month)}</p>
                <p className="text-sm text-[#52656D]">
                  {monthName(month)} de {month.year()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};

const MonthMedal = ({ label, muted = false }: { label: string; muted?: boolean }) => (
  <span
    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 text-xs font-extrabold uppercase ${
      muted
        ? "border-[#37464F] bg-[#202F36] text-[#52656D]"
        : "border-[#E5A800] bg-[#FFC800] text-[#7A4F00]"
    }`}
    aria-hidden
  >
    {label}
  </span>
);

const STATUS_OPTIONS = ["😎", "🎉", "💪", "👀", "🍿", "🔥", "😤", "💯", "💩", "🏆", "🤑", "😺"];

/** "Escolha o seu status": emoji exibido no avatar (perfil e ligas). */
const StatusPickerSection = () => {
  const { data: session } = useSession();
  const statusEmoji = useBoundStore((x) => x.statusEmoji);
  const setStatusEmoji = useBoundStore((x) => x.setStatusEmoji);
  const name = session?.user?.name ?? "Você";

  return (
    <article className={cardClass}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Escolha o seu status</h2>
        <button
          type="button"
          onClick={() => setStatusEmoji(null)}
          disabled={!statusEmoji}
          className="text-sm font-bold uppercase tracking-wide text-[#49C0F8] transition hover:brightness-110 disabled:opacity-40"
        >
          Limpar
        </button>
      </div>

      <div className="my-6 flex justify-center">
        <UserAvatar
          name={name}
          imageUrl={session?.user?.image}
          status={statusEmoji}
          size={72}
          online
        />
      </div>

      <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-label="Status">
        {STATUS_OPTIONS.map((emoji) => {
          const selected = emoji === statusEmoji;
          return (
            <button
              key={emoji}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setStatusEmoji(emoji)}
              className={`flex aspect-square items-center justify-center rounded-xl border-2 border-b-4 text-2xl transition active:translate-y-0.5 active:border-b-2 ${
                selected
                  ? "border-[#58A700] bg-[#58CC02]/20"
                  : "border-[#37464F] hover:bg-[#202F36]"
              }`}
            >
              {emoji}
            </button>
          );
        })}
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

/** Seções da RightBar por página (a linha de status e o rodapé aparecem sempre). */
const getSectionsForPath = (pathname: string) => {
  if (pathname.startsWith("/quests")) return <MedalsSection />;
  if (pathname.startsWith("/profile")) return <StatusPickerSection />;
  // Na loja a promoção já está no conteúdo principal.
  if (pathname.startsWith("/shop")) {
    return (
      <>
        <LeaguesSection />
        <DailyQuestsSection />
      </>
    );
  }
  // Nas ligas o ranking já está no conteúdo principal.
  if (pathname.startsWith("/leaderboard")) {
    return (
      <>
        <ProPromoSection />
        <DailyQuestsSection />
      </>
    );
  }
  return (
    <>
      <ProPromoSection />
      <LeaguesSection />
      <DailyQuestsSection />
    </>
  );
};

export const RightBar = () => {
  const { ref, top } = useStickyTop();
  const pathname = usePathname();

  return (
    <aside
      ref={ref}
      style={{ top }}
      className="sticky hidden w-[368px] shrink-0 flex-col gap-5 self-start lg:flex"
    >
      <StatsRow />
      {getSectionsForPath(pathname)}
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
