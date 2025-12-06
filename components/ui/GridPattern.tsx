"use client";

export default function GridPattern() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Grille principale */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      
      {/* Grille secondaire plus fine */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />
      
      {/* Effet de brillance animé */}
      <div className="absolute inset-0 animate-grid-shine">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              linear-gradient(
                90deg,
                transparent 0%,
                rgba(0, 127, 255, 0.1) 25%,
                rgba(239, 218, 91, 0.1) 50%,
                rgba(202, 62, 75, 0.1) 75%,
                transparent 100%
              )
            `,
            transform: "translateX(-100%)",
            animation: "shimmer 8s ease-in-out infinite",
          }}
        />
      </div>
      
      {/* Gradient radial au centre */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 80% 50% at 50% 50%,
              transparent 0%,
              rgba(var(--color-background), 0.3) 60%,
              rgba(var(--color-background), 0.8) 100%
            )
          `,
        }}
      />
    </div>
  );
}
