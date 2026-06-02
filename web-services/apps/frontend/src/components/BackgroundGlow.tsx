interface BackgroundGlowProps {
  color?: string;
  size?: string;
  position?: string;
}

export function BackgroundGlow({
  color = "rgba(153,69,255,0.05)",
  size = "40% 30%",
  position = "60% 0%",
}: BackgroundGlowProps) {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse ${size} at ${position}, ${color}, transparent 70%)`,
      }}
    />
  );
}
