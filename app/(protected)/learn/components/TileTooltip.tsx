import Link from "next/link";
import { useEffect, useRef } from "react";
import { units } from "@/utils/units";
import { getTileTooltipLeftOffset, type TileStatus } from "./TileUtils";

interface TileTooltipProps {
  selectedTile: number | null;
  index: number;
  unitNumber: number;
  tilesLength: number;
  description: string;
  status: TileStatus;
  closeTooltip: () => void;
}

export const TileTooltip = ({
  selectedTile,
  index,
  unitNumber,
  tilesLength,
  description,
  status,
  closeTooltip,
}: TileTooltipProps) => {
  const tileTooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const containsTileTooltip = (event: MouseEvent) => {
      if (selectedTile !== index) return;
      const clickIsInsideTooltip = tileTooltipRef.current?.contains(
        event.target as Node,
      );
      if (clickIsInsideTooltip) return;
      closeTooltip();
    };

    window.addEventListener("click", containsTileTooltip, true);
    return () => window.removeEventListener("click", containsTileTooltip, true);
  }, [selectedTile, tileTooltipRef, closeTooltip, index]);

  const unit = units.find((unit) => unit.unitNumber === unitNumber);
  const activeBackgroundColor = unit?.backgroundColor ?? "bg-[#58CC02]";
  const activeTextColor = unit?.textColor ?? "text-[#58CC02]";

  const panelColors =
    status === "ACTIVE"
      ? activeBackgroundColor
      : status === "LOCKED"
        ? "border-2 border-[#37464F] bg-[#202F36]"
        : "bg-yellow-400";

  const arrowColors =
    status === "ACTIVE"
      ? activeBackgroundColor
      : status === "LOCKED"
        ? "border-l-2 border-t-2 border-[#37464F] bg-[#202F36]"
        : "bg-yellow-400";

  return (
    <div
      className={[
        "relative h-0 w-full",
        index === selectedTile ? "" : "invisible",
      ].join(" ")}
      ref={tileTooltipRef}
    >
      <div
        className={[
          "absolute z-30 flex w-[300px] flex-col gap-4 rounded-2xl p-4 font-bold transition-all duration-300",
          panelColors,
          index === selectedTile ? "top-4 scale-100" : "-top-14 scale-0",
        ].join(" ")}
        style={{ left: "calc(50% - 150px)" }}
      >
        <div
          className={["absolute top-[-8px] h-4 w-4 rotate-45", arrowColors].join(" ")}
          style={{
            left: getTileTooltipLeftOffset({ index, unitNumber, tilesLength }),
          }}
        ></div>
        <div
          className={[
            "text-lg",
            status === "ACTIVE"
              ? "text-white"
              : status === "LOCKED"
                ? "text-[#52656D]"
                : "text-yellow-800",
          ].join(" ")}
        >
          {description}
        </div>
        {status === "ACTIVE" ? (
          <Link
            href="/lesson"
            className={[
              "flex w-full items-center justify-center rounded-xl border-b-4 border-gray-200 bg-white p-3 uppercase tracking-wide",
              activeTextColor,
            ].join(" ")}
          >
            Começar +10 XP
          </Link>
        ) : status === "LOCKED" ? (
          <button
            className="w-full rounded-xl bg-[#37464F] p-3 uppercase tracking-wide text-[#52656D]"
            disabled
          >
            Bloqueado
          </button>
        ) : (
          <Link
            href="/lesson?practice=1"
            className="flex w-full items-center justify-center rounded-xl border-b-4 border-yellow-200 bg-white p-3 uppercase tracking-wide text-yellow-500"
          >
            Praticar +5 XP
          </Link>
        )}
      </div>
    </div>
  );
};
