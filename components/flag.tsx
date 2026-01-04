"use client";

import type { StaticImageData } from "next/image";
import _flagsSvg from "@/public/flags.svg";
import Image from "next/image";

const flagsSvg = _flagsSvg as StaticImageData;

// Tipo unificado que funciona com ambas as estruturas
interface UnifiedLanguage {
  code: string;
  name: string;
  flag: string;
  viewBox?: string; // Opcional para nova estrutura
  shortName?: string;
  direction?: "ltr" | "rtl";
}

interface FlagProps {
  language: UnifiedLanguage;
  width?: number;
  height?: number;
  className?: string;
}

export const Flag = ({
  language,
  width = 24,
  height,
  className = "",
}: FlagProps) => {
  const finalHeight = height || width * (3 / 4);

  // Verifica se temos viewBox (sprite sheet) ou bandeira individual
  const useSpriteSheet = !!language.viewBox;

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width, height: finalHeight }}
    >
      {useSpriteSheet ? (
        <svg
          viewBox={language.viewBox}
          width={width}
          height={finalHeight}
          className="inline-block"
        >
          <Image
            height={flagsSvg.height}
            src={`/flags/${flagsSvg.src}`}
            width={flagsSvg.width}
            alt={flagsSvg.src}
          />
        </svg>
      ) : (
        <img
          src={`/flags/${language.flag}`}
          alt={`${language.name} flag`}
          width={width}
          height={finalHeight}
          className="rounded-sm object-cover size-5"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
      )}
    </div>
  );
};
