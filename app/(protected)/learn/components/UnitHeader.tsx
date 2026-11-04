import { ArrowLeft } from "lucide-react";

interface UnitHeaderProps {
  section: number;
  unitInSection: number;
  title: string;
  backgroundColor: `bg-${string}`;
  borderColor: `border-${string}`;
}

/** Card colorido com "SEÇÃO X, UNIDADE Y" e o título da unidade. */
export const UnitHeader = ({
  section,
  unitInSection,
  title,
  backgroundColor,
  borderColor,
}: UnitHeaderProps) => {
  return (
    <article
      className={[
        "rounded-2xl border-b-4 px-4 py-3 text-white",
        backgroundColor,
        borderColor,
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/75 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={3} />
        Seção {section}, unidade {unitInSection}
      </button>
      <h2 className="mt-1 text-xl font-bold">{title}</h2>
    </article>
  );
};
