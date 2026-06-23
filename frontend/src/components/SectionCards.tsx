// src/components/SectionCards.tsx

"use client";

import { Record } from "@/types";

interface SectionCardsProps {
  sections: Record<string, string>;
}

const SECTION_CONFIG: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
  "STRENGTHS": { icon: "✅", label: "Strengths", color: "#22c55e", bgColor: "#22c55e15" },
  "WEAKNESSES": { icon: "⚠️", label: "Weaknesses", color: "#f97316", bgColor: "#f9731615" },
  "KEYWORD MATCH": { icon: "🎯", label: "Keyword Match", color: "#06b6d4", bgColor: "#06b6d415" },
  "SUGGESTIONS": { icon: "💡", label: "Suggestions", color: "#3b82f6", bgColor: "#3b82f615" },
  "SKILLS GAP": { icon: "🔧", label: "Skills Gap", color: "#a855f7", bgColor: "#a855f715" },
  "FORMATTING TIPS": { icon: "📝", label: "Formatting Tips", color: "#14b8a6", bgColor: "#14b8a615" },
  "SUMMARY": { icon: "📋", label: "Summary", color: "#9ca3af", bgColor: "#9ca3af15" },
};

export default function SectionCards({ sections }: SectionCardsProps) {
  if (!sections || Object.keys(sections).length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(sections).map(([key, content]) => {
        const config = SECTION_CONFIG[key] || {
          icon: "📄",
          label: key,
          color: "#9ca3af",
          bgColor: "#9ca3af15",
        };

        return (
          <div
            key={key}
            className="rounded-xl border p-5"
            style={{
              borderColor: `${config.color}30`,
              backgroundColor: config.bgColor,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{config.icon}</span>
              <h4
                className="font-semibold text-sm uppercase tracking-wide"
                style={{ color: config.color }}
              >
                {config.label}
              </h4>
            </div>
            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {content}
            </div>
          </div>
        );
      })}
    </div>
  );
}