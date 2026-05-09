"use client";

import { useEffect, useMemo, useState } from "react";

type QuestCountdownProps = {
  expiresAt: string;
};

const formatRemaining = (ms: number) => {
  if (ms <= 0) return "00:00:00";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

export const QuestCountdown = ({ expiresAt }: QuestCountdownProps) => {
  const target = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [remaining, setRemaining] = useState(() => formatRemaining(target - Date.now()));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(formatRemaining(target - Date.now()));
    }, 1000);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{remaining}</span>;
};
