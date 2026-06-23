// src/components/KeywordGapChart.tsx

"use client";

import { useEffect, useState } from "react";
import { getKeywordGap } from "@/api/analytics";
import { KeywordData } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface KeywordGapChartProps {
  analysisId: string;
}

export default function KeywordGapChart({ analysisId }: KeywordGapChartProps) {
  const [keywordData, setKeywordData] = useState<KeywordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasJD, setHasJD] = useState(false);

  useEffect(() => {
    getKeywordGap(analysisId)
      .then((data) => {
        setKeywordData(data.keywords);
        setHasJD(data.has_jd);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [analysisId]);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p className="text-gray-400 text-center text-sm">Loading keywords...</p>
      </div>
    );
  }

  if (!hasJD) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <p className="text-gray-500 text-sm">
          💡 Analyze with a job description to see keyword gap analysis
        </p>
      </div>
    );
  }

  if (!keywordData || (keywordData.matched.length === 0 && keywordData.missing.length === 0)) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <p className="text-gray-500 text-sm">
          Keyword data could not be parsed. Check the "Keyword Match" section in the analysis.
        </p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = [
    { name: "Matched", count: keywordData.matched.length, color: "#22c55e" },
    { name: "Missing", count: keywordData.missing.length, color: "#ef4444" },
  ];

  const total = keywordData.matched.length + keywordData.missing.length;
  const matchPct = keywordData.match_percentage || Math.round((keywordData.matched.length / total) * 100);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Keyword Gap Analysis</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-400">{matchPct}%</span>
          <span className="text-gray-400 text-xs">match</span>
        </div>
      </div>

      {/* Match Percentage Bar */}
      <div className="w-full bg-gray-800 rounded-full h-3 mb-6">
        <div
          className="h-3 rounded-full transition-all duration-1000"
          style={{
            width: `${matchPct}%`,
            background: `linear-gradient(90deg, #22c55e ${0}%, #22c55e ${60}%, #eab308 ${60}%, #eab308 ${80}%, #ef4444 ${80}%)`,
          }}
        />
      </div>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
          <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} />
          <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} width={70} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Keyword Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Matched */}
        <div>
          <h4 className="text-green-400 text-sm font-semibold mb-2 flex items-center gap-1">
            ✅ Matched ({keywordData.matched.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {keywordData.matched.map((kw, i) => (
              <span
                key={i}
                className="bg-green-900/30 border border-green-800 text-green-300 text-xs px-2 py-1 rounded"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Missing */}
        <div>
          <h4 className="text-red-400 text-sm font-semibold mb-2 flex items-center gap-1">
            ❌ Missing ({keywordData.missing.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {keywordData.missing.map((kw, i) => (
              <span
                key={i}
                className="bg-red-900/30 border border-red-800 text-red-300 text-xs px-2 py-1 rounded"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}