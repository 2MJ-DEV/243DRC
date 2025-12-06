"use client";

interface FloatingOrbProps {
  color: string;
  size: string;
  duration: string;
  delay: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}

export default function FloatingOrb({
  color,
  size,
  duration,
  delay,
  top,
  left,
  right,
  bottom,
}: FloatingOrbProps) {
  return (
    <div
      className="absolute rounded-full blur-3xl opacity-20 animate-float"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        animation: `float ${duration} ease-in-out ${delay} infinite`,
      }}
    />
  );
}
