import Link from "next/link";
import type { Unit } from "@/utils/units";
import { TileTooltip } from "./TileTooltip";
import { UnitHeader } from "./UnitHeader";

interface UnitSectionProps {
  unit: Unit;
}

const statusClass: Record<string, string> = {
  completed: "border-emerald-500 bg-emerald-50",
  available: "border-blue-500 bg-blue-50",
  locked: "border-zinc-200 bg-zinc-100 opacity-60",
};

export const UnitSection = ({ unit }: UnitSectionProps) => (
  <section className="rounded-xl border p-4">
    <UnitHeader unitNumber={unit.number} title={unit.title} description={unit.description} />

    <div className="grid gap-3 md:grid-cols-2">
      {unit.tiles.map((tile) => {
        const isLocked = tile.status === "locked";

        return (
          <article key={tile.id} className={`rounded-lg border p-3 ${statusClass[tile.status]}`}>
            <TileTooltip tile={tile} />
            {isLocked ? (
              <div className="cursor-not-allowed text-sm font-semibold text-zinc-500">{tile.title}</div>
            ) : (
              <Link href={tile.href} className="text-sm font-semibold underline">
                {tile.title}
              </Link>
            )}
          </article>
        );
      })}
    </div>
  </section>
);
