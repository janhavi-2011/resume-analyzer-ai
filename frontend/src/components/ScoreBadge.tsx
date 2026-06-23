// src/components/ScoreBadge.tsx

"use client";

import { useEffect, useState } from "react";

interface ScoreBadgeProps {
  score: number | null;
  size?: "sm" | "lg";
}

export default function ScoreBadge({ score, size = "lg" }: ScoreBadgeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (score === null) return;
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(interval);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [score]);

  if (score === null) return null;

  const getColor = (s: number) => {
    if (s >= 81) return { stroke: "#22c55e", bg: "#16a34a20", text: "Excellent", textCol: "#22c55e" };
    if (s >= 61) return { stroke: "#eab308", bg: "#eab30820", text: "Good", textCol: "#eab308" };
    if (s >= 41) return { stroke: "#f97316", bg: "#f9731620", text: "Fair", textCol: "#f97316" };
    return { stroke: "#ef4444", bg: "#ef444420", text: "Needs Work", textCol: "#ef4444" };
  };

  const colors = getColor(score);

  const dim = size === "lg" ? 160 : 80;
  const radius = size === "lg" ? 60 : 30;
  const strokeWidth = size === "lg" ? 8 : 5;
  const center = dim / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={dim} height={dim}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#1f2937"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
        />
        {/* Score text */}
        <text
          x={center}
          y={center - (size === "lg" ? 5 : 2)}
          textAnchor="middle"
          fill="white"
          fontSize={size === "lg" ? 36 : 18}
          fontWeight="bold"
        >
          {animatedScore}
        </text>
        <text
          x={center}
          y={center + (size === "lg" ? 20 : 12)}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize={size === "lg" ? 14 : 8}
        >
          / 100
        </text>
      </svg>
      <span
        className="font-semibold text-sm px-3 py-1 rounded-full"
        style={{ backgroundColor: colors.bg, color: colors.textCol }}
      >
        {colors.text}
      </span>
    </div>
  );
}