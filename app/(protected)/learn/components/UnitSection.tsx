import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useState, type JSX } from "react";
import { useBoundStore } from "@/hooks/useBoundStore";
import type { Unit } from "@/utils/units";
import { HoverLabel } from "./HoverLabel";
import { LessonCompletionSvg } from "./Lessoncompletionsvg";
import { TileIcon } from "./TileIcon";
import { TileTooltip } from "./TileTooltip";
import { UnitHeader } from "./UnitHeader";
import { getTileColors, getTileLeftClassName, tileStatus } from "./TileUtils";

interface UnitSectionProps {
  unit: Unit;
}

const UnitDivider = ({ title }: { title: string }) => (
  <div className="flex items-center gap-4 py-6" role="separator">
    <div className="h-0.5 flex-1 bg-[#37464F]" />
    <span className="text-lg font-bold text-[#52656D]">{title}</span>
    <div className="h-0.5 flex-1 bg-[#37464F]" />
  </div>
);

export const UnitSection = ({ unit }: UnitSectionProps): JSX.Element => {
  const router = useRouter();

  const [selectedTile, setSelectedTile] = useState<null | number>(null);

  useEffect(() => {
    const unselectTile = () => setSelectedTile(null);
    window.addEventListener("scroll", unselectTile);
    return () => window.removeEventListener("scroll", unselectTile);
  }, []);

  const closeTooltip = useCallback(() => setSelectedTile(null), []);

  const lessonsCompleted = useBoundStore((x) => x.lessonsCompleted);
  const increaseLessonsCompleted = useBoundStore(
    (x) => x.increaseLessonsCompleted,
  );
  const increaseLingots = useBoundStore((x) => x.increaseLingots);

  return (
    // O <section> limita o header "sticky": quando a próxima unidade chega
    // ao topo, o header dela empurra o desta para fora.
    <section className="relative">
      <div className="sticky top-[58px] z-20 bg-[#131F24] pb-2 lg:top-0 lg:pt-6">
        <UnitHeader
          section={unit.section}
          unitInSection={unit.unitInSection}
          title={unit.title}
          backgroundColor={unit.backgroundColor}
          borderColor={unit.borderColor}
        />
      </div>

      <UnitDivider title={unit.title} />

      <div className="relative mx-auto mb-8 mt-12 flex max-w-2xl flex-col items-center gap-4">
        {unit.tiles.map((tile, i): JSX.Element => {
          const status = tileStatus(tile, lessonsCompleted);
          return (
            <Fragment key={i}>
              {(() => {
                switch (tile.type) {
                  case "star":
                  case "book":
                  case "dumbbell":
                  case "trophy":
                  case "fast-forward":
                    if (tile.type === "trophy" && status === "COMPLETE") {
                      return (
                        <div className="relative">
                          <TileIcon tileType={tile.type} status={status} />
                          <div className="absolute left-0 right-0 top-6 flex justify-center text-lg font-bold text-yellow-700">
                            {unit.unitNumber}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div
                        className={[
                          "relative -mb-4 h-[93px] w-[98px]",
                          getTileLeftClassName({
                            index: i,
                            unitNumber: unit.unitNumber,
                            tilesLength: unit.tiles.length,
                          }),
                        ].join(" ")}
                      >
                        {tile.type === "fast-forward" && status === "LOCKED" ? (
                          <HoverLabel
                            text="Pular para cá?"
                            textColor={unit.textColor}
                          />
                        ) : selectedTile !== i && status === "ACTIVE" ? (
                          <HoverLabel text="Começar" textColor={unit.textColor} />
                        ) : null}
                        <LessonCompletionSvg
                          lessonsCompleted={lessonsCompleted}
                          status={status}
                        />
                        <button
                          className={[
                            "absolute m-3 rounded-full border-b-8 p-4 transition active:translate-y-1 active:border-b-4",
                            getTileColors({
                              tileType: tile.type,
                              status,
                              defaultColors: `${unit.borderColor} ${unit.backgroundColor}`,
                            }),
                          ].join(" ")}
                          onClick={() => {
                            if (
                              tile.type === "fast-forward" &&
                              status === "LOCKED"
                            ) {
                              router.push(
                                `/lesson?fast-forward=${unit.unitNumber}`,
                              );
                              return;
                            }
                            setSelectedTile(i);
                          }}
                        >
                          <TileIcon tileType={tile.type} status={status} />
                          <span className="sr-only">Ver lição</span>
                        </button>
                      </div>
                    );
                  case "treasure":
                    return (
                      <div
                        className={[
                          "relative -mb-4",
                          getTileLeftClassName({
                            index: i,
                            unitNumber: unit.unitNumber,
                            tilesLength: unit.tiles.length,
                          }),
                        ].join(" ")}
                        onClick={() => {
                          if (status === "ACTIVE") {
                            increaseLessonsCompleted(4);
                            increaseLingots(1);
                          }
                        }}
                        role="button"
                        tabIndex={status === "ACTIVE" ? 0 : undefined}
                        aria-hidden={status !== "ACTIVE"}
                        aria-label={status === "ACTIVE" ? "Coletar recompensa" : ""}
                      >
                        {status === "ACTIVE" && (
                          <HoverLabel text="Abrir" textColor="text-yellow-400" />
                        )}
                        <TileIcon tileType={tile.type} status={status} />
                      </div>
                    );
                }
              })()}
              <TileTooltip
                selectedTile={selectedTile}
                index={i}
                unitNumber={unit.unitNumber}
                tilesLength={unit.tiles.length}
                description={(() => {
                  switch (tile.type) {
                    case "book":
                    case "dumbbell":
                    case "star":
                      return tile.description;
                    case "fast-forward":
                      return status === "LOCKED"
                        ? "Pular para cá?"
                        : tile.description;
                    case "trophy":
                      return `Revisão da unidade ${unit.unitNumber}`;
                    case "treasure":
                      return "";
                  }
                })()}
                status={status}
                closeTooltip={closeTooltip}
              />
            </Fragment>
          );
        })}
      </div>
    </section>
  );
};
