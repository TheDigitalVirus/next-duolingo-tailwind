/** Selo inclinado com gradiente que marca recursos do plano Pro. */
export const ProBadge = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-block -skew-x-12 rounded-md bg-gradient-to-r from-[#26FF55] via-[#1CB0F6] to-[#E619DF] px-2.5 py-0.5 text-sm font-extrabold italic tracking-wider text-white ${className}`}
  >
    PRO
  </span>
);
