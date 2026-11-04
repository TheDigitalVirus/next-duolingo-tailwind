import { useLayoutEffect, useRef, useState } from "react";

interface HoverLabelProps {
  text: string;
  textColor: `text-${string}`;
}

/** Balão animado ("COMEÇAR") que flutua acima do tile ativo. */
export const HoverLabel = ({ text, textColor }: HoverLabelProps) => {
  const hoverElement = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(72);

  useLayoutEffect(() => {
    if (hoverElement.current) {
      setWidth(hoverElement.current.clientWidth);
    }
  }, [text]);

  return (
    <div
      className={`absolute z-10 w-max animate-bounce rounded-xl border-2 border-[#37464F] bg-[#131F24] px-3 py-2 font-bold uppercase tracking-wide ${textColor}`}
      style={{
        top: "-25%",
        left: `calc(50% - ${width / 2}px)`,
      }}
      ref={hoverElement}
    >
      {text}
      <div
        className="absolute h-3 w-3 rotate-45 border-b-2 border-r-2 border-[#37464F] bg-[#131F24]"
        style={{ left: "calc(50% - 8px)", bottom: "-8px" }}
      ></div>
    </div>
  );
};
