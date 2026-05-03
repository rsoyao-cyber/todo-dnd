import confetti from 'canvas-confetti';

// Vellum palette — small, tasteful burst
const COLORS = ['#A84A2A', '#C9B98E', '#E6DBB8', '#5A4A33', '#6B7A5A'];

export function fireCompletionConfetti() {
  confetti({
    particleCount: 22,
    spread: 48,
    startVelocity: 18,
    decay: 0.92,
    scalar: 0.75,
    colors: COLORS,
    origin: { y: 0.55 },
    ticks: 80,
    disableForReducedMotion: true,
  });
}
