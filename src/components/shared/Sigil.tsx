import type { CSSProperties } from 'react';

export type SigilShape = 'diamond' | 'circle' | 'hex';

interface SigilProps {
  shape?:  SigilShape;
  filled?: boolean;
  color?:  string;
  ring?:   string;
  size?:   number;
  style?:  CSSProperties;
}

export function Sigil({ shape = 'diamond', filled = false, color, ring, size = 22, style }: SigilProps) {
  const fill  = filled ? color : 'transparent';
  const inner = filled ? '#FBF5EA' : 'transparent';

  if (shape === 'circle') {
    return (
      <svg width={size} height={size} viewBox="0 0 22 22" style={style}>
        <circle cx="11" cy="11" r="9" fill={fill} stroke={ring} strokeWidth="1.25" />
        {filled && <circle cx="11" cy="11" r="3.2" fill={inner} />}
      </svg>
    );
  }

  if (shape === 'hex') {
    return (
      <svg width={size} height={size} viewBox="0 0 22 22" style={style}>
        <polygon
          points="11,2.2 18.6,6.6 18.6,15.4 11,19.8 3.4,15.4 3.4,6.6"
          fill={fill} stroke={ring} strokeWidth="1.25" strokeLinejoin="round"
        />
        {filled && (
          <polygon points="11,7.5 14.5,9.7 14.5,13.5 11,15.7 7.5,13.5 7.5,9.7" fill={inner} />
        )}
      </svg>
    );
  }

  // diamond (default)
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" style={style}>
      <polygon
        points="11,2.2 19.8,11 11,19.8 2.2,11"
        fill={fill} stroke={ring} strokeWidth="1.25" strokeLinejoin="round"
      />
      {filled && (
        <polygon points="11,7.4 14.6,11 11,14.6 7.4,11" fill={inner} />
      )}
    </svg>
  );
}
