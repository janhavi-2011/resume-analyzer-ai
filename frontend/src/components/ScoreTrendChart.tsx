// src/components/ScoreTrendChart.tsx

"use client";

import { useEffect, useState } from "react";
import { getScoreTrends } from "@/api/analytics";
import { TrendPoint } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";

export default function ScoreTrendChart() {
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScoreTrends()
      .then((data) => setTrends(data.trends))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p className="text-gray-400 text-center">Loading trends...</p>
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <p className="text-gray-500">No analysis data yet. Analyze your first resume to see trends!</p>
      </div>
    );
  }

  // Prepare data for chart
  const chartData = trends.map((t) => ({
    ...t,
    shortDate: t.date.split(" ")[0].slice(5), // "MM-DD"
    name: t.resume_filename.length > 20
      ? t.resume_filename.slice(0, 20) + "..."
      : t.resume_filename,
  }));

  const avgScore = trends.length > 0
    ? Math.round(trends.reduce((sum, t) => sum + t.score, 0) / trends.length)
    : 0;

  const latestScore = trends[trends.length - 1]?.score || 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Score Trend</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-gray-400">Average: {avgScore}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-gray-400">Latest: {latestScore}</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="shortDate"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#9ca3af" }}
            itemStyle={{ color: "#3b82f6" }}
            formatter={(value: number) => [`${value}/100`, "Score"]}
            labelFormatter={(label) => {
              const item = chartData.find((d) => d.shortDate === label);
              return item?.name || label;
            }}
          />
          <ReferenceLine
            y={avgScore}
            stroke="#6366f1"
            strokeDasharray="5 5"
            strokeOpacity={0.5}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#scoreGradient)"
            dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#60a5fa" }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {trends.length === 1 && (
        <p className="text-gray-500 text-xs text-center mt-2">
          Analyze more resumes to see your trend line grow!
        </p>
      )}
    </div>
  );
}