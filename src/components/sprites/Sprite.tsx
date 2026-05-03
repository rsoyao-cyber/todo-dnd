import type { CSSProperties } from 'react';
import { SPRITES } from './sprites';
import type { SpriteName } from './sprites';

export type { SpriteName };

interface SpriteProps {
  name: SpriteName;
  size?: number;
  accent?: string;
  color?: string;
  style?: CSSProperties;
}

export function Sprite({ name, size = 32, accent, color, style }: SpriteProps) {
  const sprite = SPRITES[name];
  const { palette, grid } = sprite;
  const pal: Record<string, string> = {
    ...palette,
    A: accent ?? '#C2410C',
    C: color  ?? '#1A1714',
  };
  const w = grid[0].length;
  const h = grid.length;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      style={{ display: 'block', ...style }}
    >
      {grid.map((row, y) =>
        row.split('').map((ch, x) => {
          if (ch === '.') return null;
          const fill = pal[ch];
          if (!fill) return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
        })
      )}
    </svg>
  );
}
