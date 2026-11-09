"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Modal centralizado no estilo do app: ilustração, título, conteúdo e
 * botão "CONTINUAR". Esc também continua.
 */
export const GameModal = ({
  illustration,
  title,
  children,
  continueLabel = "Continuar",
  onContinue,
}: {
  illustration: ReactNode;
  title: string;
  children?: ReactNode;
  continueLabel?: string;
  onContinue: () => void;
}) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onContinue();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onContinue]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-modal-title"
        className="w-full max-w-[440px] rounded-2xl border-2 border-[#37464F] bg-[#131F24] px-6 pb-6 pt-10 text-center"
      >
        <div className="flex justify-center">{illustration}</div>
        <h2 id="game-modal-title" className="mt-8 text-2xl font-bold text-white">
          {title}
        </h2>
        {children && <div className="mt-4 text-[15px] leading-6 text-[#DCE6EC]">{children}</div>}
        <button
          type="button"
          autoFocus
          onClick={onContinue}
          className="mt-10 w-full rounded-2xl border-b-4 border-[#1899D6] bg-[#49C0F8] py-3.5 text-sm font-bold uppercase tracking-wide text-[#131F24] transition hover:brightness-110 active:translate-y-0.5 active:border-b-2"
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
};
