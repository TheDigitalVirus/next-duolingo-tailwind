import type { Tile } from "@/utils/units";
import { HoverLabel } from "./HoverLabel";

interface TileTooltipProps {
  tile: Tile;
}

export const TileTooltip = ({ tile }: TileTooltipProps) => (
  <div className="mb-2 flex items-center gap-2">
    <HoverLabel>{tile.description}</HoverLabel>
    <span className="text-xs text-zinc-500">{tile.status}</span>
  </div>
);
