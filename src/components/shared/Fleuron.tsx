interface FleuronProps {
  color: string;
  w?: number;
}

export function Fleuron({ color, w = 64 }: FleuronProps) {
  return (
    <svg width={w} height={10} viewBox="0 0 64 10" style={{ display: 'block' }}>
      <line x1="0"  y1="5" x2="22" y2="5" stroke={color} strokeWidth="0.6" />
      <line x1="42" y1="5" x2="64" y2="5" stroke={color} strokeWidth="0.6" />
      <circle cx="32" cy="5" r="2.2" fill="none" stroke={color} strokeWidth="0.7" />
      <circle cx="32" cy="5" r="0.7" fill={color} />
    </svg>
  );
}
