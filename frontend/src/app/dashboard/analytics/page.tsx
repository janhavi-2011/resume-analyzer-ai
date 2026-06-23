// src/app/dashboard/analytics/page.tsx

"use client";
import { AnalyticsSkeleton } from "@/components/Skeleton";
import { useEffect, useState } from "react";
import { getPlan } from "@/api/analytics";
import { PlanInfo } from "@/types";
import ScoreTrendChart from "@/components/ScoreTrendChart";
import AnalysisHistory from "@/components/AnalysisHistory";
import PlanBadge from "@/components/PlanBadge";
import Link from "next/link";

export default function AnalyticsPage() {
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const refreshPlan = () => {
    setPageLoading(true);

    getPlan()
      .then(setPlan)
      .catch(() => { })
      .finally(() => setPageLoading(false));
  };

  useEffect(() => {
    refreshPlan();
  }, []);

  if (pageLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard" className="text-blue-400 text-sm hover:underline mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-400 mt-1">Track your resume improvements over time</p>
        </div>
        <PlanBadge plan={plan} onPlanChange={refreshPlan} />
      </div>

      {/* Plan Stats */}
      {plan && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Plan</p>
            <p className={`text-2xl font-bold mt-1 ${plan.plan === "pro" ? "text-purple-400" : "text-gray-200"}`}>
              {plan.plan === "pro" ? "⚡ Pro" : "🆓 Free"}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Used</p>
            <p className="text-2xl font-bold mt-1">{plan.used}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Remaining</p>
            <p className={`text-2xl font-bold mt-1 ${plan.remaining <= 1 ? "text-red-400" : "text-green-400"}`}>
              {plan.remaining}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Limit</p>
            <p className="text-2xl font-bold mt-1">{plan.limit}</p>
          </div>
        </div>
      )}

      {/* Score Trend Chart */}
      <div className="mb-8">
        <ScoreTrendChart />
      </div>

      {/* Analysis History */}
      <AnalysisHistory />
    </div>
  );
}