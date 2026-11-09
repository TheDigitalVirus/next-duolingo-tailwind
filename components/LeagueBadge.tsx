import { Feather, Lock } from "lucide-react";
import type { LeagueTier } from "@/utils/leagues";

/**
 * Escudo hexagonal da divisão. `locked` desenha em cinza com cadeado
 * (divisões acima da atual).
 */
export const LeagueBadge = ({
  league,
  size = 56,
  locked = false,
  showIcon = true,
}: {
  league: LeagueTier;
  size?: number;
  locked?: boolean;
  showIcon?: boolean;
}) => {
  const color = locked ? "#37464F" : league.color;
  const light = locked ? "#4B5B64" : league.light;
  const dark = locked ? "#2B3940" : league.dark;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size * 1.1 }}>
      <svg viewBox="0 0 100 110" className="h-full w-full" aria-hidden>
        {/* Base mais escura deslocada: dá o efeito 3D. */}
        <path d="M28 10h44l22 26v36L72 102H28L6 72V36z" transform="translate(0 6)" fill={dark} />
        <path d="M28 6h44l22 26v36L72 98H28L6 68V32z" fill={color} />
        <path d="M32 16h36l16 20v28L68 88H32L16 64V36z" fill={light} opacity="0.55" />
      </svg>
      {showIcon && (
        <span className="absolute inset-0 flex items-center justify-center pb-1">
          {locked ? (
            <Lock className="text-[#52656D]" style={{ width: size * 0.32, height: size * 0.32 }} strokeWidth={3} />
          ) : (
            <Feather
              style={{ width: size * 0.4, height: size * 0.4, color: league.dark }}
              strokeWidth={2.5}
            />
          )}
        </span>
      )}
      <span className="sr-only">Divisão {league.name}</span>
    </div>
  );
};
