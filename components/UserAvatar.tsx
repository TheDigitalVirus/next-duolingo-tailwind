/* eslint-disable @next/next/no-img-element */

const AVATAR_COLORS = ["#1CB0F6", "#58CC02", "#CE82FF", "#FF9600", "#FF4B4B", "#00CD9C"];

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const colorFor = (name: string) =>
  AVATAR_COLORS[Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0) % AVATAR_COLORS.length];

/**
 * Avatar redondo (foto ou iniciais) com o emoji de status opcional
 * no canto superior direito.
 */
export const UserAvatar = ({
  name,
  imageUrl,
  status,
  size = 48,
  online = false,
}: {
  name: string;
  imageUrl?: string | null;
  status?: string | null;
  size?: number;
  online?: boolean;
}) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    {imageUrl ? (
      <img
        src={imageUrl}
        alt={name}
        className="h-full w-full rounded-full bg-[#202F36] object-cover"
      />
    ) : (
      <div
        className="flex h-full w-full items-center justify-center rounded-full font-bold text-white"
        style={{ backgroundColor: colorFor(name), fontSize: size * 0.38 }}
        aria-label={name}
      >
        {initialsOf(name)}
      </div>
    )}
    {status && (
      <span
        className="absolute -right-2 -top-1 flex items-center justify-center rounded-lg bg-[#131F24] leading-none"
        style={{ width: size * 0.5, height: size * 0.5, fontSize: size * 0.34 }}
        aria-label={`Status: ${status}`}
      >
        {status}
      </span>
    )}
    {online && (
      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#131F24] bg-[#58CC02]" />
    )}
  </div>
);
