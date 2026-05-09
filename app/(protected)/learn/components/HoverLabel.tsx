import type { ReactNode } from "react";

interface HoverLabelProps {
  children: ReactNode;
}

export const HoverLabel = ({ children }: HoverLabelProps) => (
  <span className="rounded-full bg-black px-2 py-1 text-xs text-white">{children}</span>
);
