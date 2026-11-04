"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import DuoMascot from "@/public/duo.svg";

const DISMISSED_AT_KEY = "notification-prompt-dismissed-at";
/** Depois de "Agora não", perguntar de novo só após este intervalo. */
const ASK_AGAIN_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
/** Espera um pouco após abrir a página para não interromper de cara. */
const SHOW_DELAY_MS = 1500;

const shouldAsk = () => {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "default") return false;

  const dismissedAt = Number(localStorage.getItem(DISMISSED_AT_KEY) ?? 0);
  return Date.now() - dismissedAt > ASK_AGAIN_AFTER_MS;
};

/**
 * Modal "Fique em dia!" que pede permissão para notificações do navegador.
 * Só aparece se o usuário ainda não decidiu e não recusou nos últimos 7 dias.
 */
export const NotificationPrompt = () => {
  const [open, setOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!shouldAsk()) return;
    const timer = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, dismiss]);

  const allow = async () => {
    setRequesting(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("Tudo pronto!", {
          body: "Vamos te lembrar de praticar todos os dias.",
          icon: "/favicon.ico",
        });
      } else {
        // Negado ou fechado: guarda para não insistir.
        localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
      }
    } finally {
      setRequesting(false);
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-prompt-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-[376px] rounded-2xl border-2 border-[#37464F] bg-[#131F24] px-6 pb-6 pt-8 text-center"
      >
        <div className="relative mx-auto h-[130px] w-[150px]">
          <Image src={DuoMascot} alt="" fill className="object-contain" />
          <BellRing
            className="absolute -right-3 bottom-4 h-12 w-12 origin-top animate-wiggle fill-[#FFC800] text-[#E5A800]"
            aria-hidden
          />
          <div className="absolute -bottom-2 left-1/2 h-1.5 w-24 -translate-x-1/2 rounded-full bg-[#37464F]" />
        </div>

        <h2 id="notification-prompt-title" className="mt-8 text-2xl font-bold text-white">
          Fique em dia!
        </h2>
        <p className="mt-4 text-[15px] leading-6 text-[#DCE6EC]">
          Enviaremos lembretes pra você não esquecer de praticar.
        </p>

        <button
          type="button"
          onClick={allow}
          disabled={requesting}
          className="mt-8 w-full rounded-2xl border-b-4 border-[#1899D6] bg-[#49C0F8] py-3.5 text-sm font-bold uppercase tracking-wide text-[#131F24] transition hover:brightness-110 active:translate-y-0.5 active:border-b-2 disabled:opacity-60"
        >
          {requesting ? "Aguardando..." : "Permitir notificações"}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="mt-4 w-full py-2 text-sm font-bold uppercase tracking-wide text-[#49C0F8] transition hover:brightness-110"
        >
          Agora não
        </button>
      </div>
    </div>
  );
};
