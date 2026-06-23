// src/app/dashboard/page.tsx

"use client";
import Cookies from "js-cookie";
import { DashboardSkeleton } from "@/components/Skeleton";
import { useEffect, useState } from "react";
import { getMe } from "@/api/auth";
import { getResumes as fetchResumes } from "@/api/resume";
import { getPlan } from "@/api/analytics";
import { User, ResumeUploadResponse } from "@/types";
import { PlanInfo } from "@/types";
import ResumeDropzone from "@/components/ResumeDropzone";
import ResumeList from "@/components/ResumeList";
import TextPreview from "@/components/TextPreview";
import PlanBadge from "@/components/PlanBadge";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  console.log("STATUS =", status);
  console.log("SESSION =", session);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpload, setLastUpload] = useState<ResumeUploadResponse | null>(null);
  const [resumeCount, setResumeCount] = useState(0);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshData = () => {
    fetchResumes().then((data) => setResumeCount(data.total)).catch(() => { });
    getPlan().then(setPlan).catch(() => { });
  };

 

  useEffect(() => {
    if (status !== "authenticated") return;

    const accessToken = (session as any)?.accessToken;
    const refreshToken = (session as any)?.refreshToken;

    if (!accessToken) return;

    Cookies.set("access_token", accessToken, {
      secure: true,
      sameSite: "strict",
    });

    if (refreshToken) {
      Cookies.set("refresh_token", refreshToken, {
        secure: true,
        sameSite: "strict",
      });
    }

    getMe()
      .then((data) => setUser(data))
      .catch(console.error)
      .finally(() => setLoading(false));

    refreshData();
  }, [status, session, refreshKey]);

  const handleUploadSuccess = (resume: ResumeUploadResponse) => {
    setLastUpload(resume);
    setResumeCount((prev) => prev + 1);
    setRefreshKey((prev) => prev + 1);
  };

  const handlePlanChange = () => {
    getPlan().then(setPlan).catch(() => { });
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.email || "User"}</p>
        </div>
        <div className="flex items-center gap-3">
          <PlanBadge plan={plan} onPlanChange={handlePlanChange} />
          <Link
            href="/dashboard/analytics"
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-gray-400 text-xs mb-1">Resumes</h3>
          <p className="text-2xl font-bold">{resumeCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-gray-400 text-xs mb-1">AI Used</h3>
          <p className="text-2xl font-bold">{plan?.used ?? 0}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-gray-400 text-xs mb-1">Remaining</h3>
          <p className={`text-2xl font-bold ${(plan?.remaining ?? 10) <= 1 ? "text-red-400" : "text-green-400"}`}>
            {plan?.remaining ?? "—"}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-gray-400 text-xs mb-1">Plan</h3>
          <p className={`text-2xl font-bold ${plan?.plan === "pro" ? "text-purple-400" : ""}`}>
            {plan?.plan === "pro" ? "⚡ Pro" : "Free"}
          </p>
        </div>
      </div>

      {/* Usage Warning */}
      {plan && plan.remaining <= 1 && plan.plan === "free" && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div>
            <p className="text-yellow-300 text-sm font-medium">Running low on analyses!</p>
            <p className="text-yellow-400/70 text-xs">You have {plan.remaining} remaining on the Free plan.</p>
          </div>
          <Link
            href="/dashboard/analytics"
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm font-medium"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* Upload Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
        <ResumeDropzone onUploadSuccess={handleUploadSuccess} />
      </div>

      {lastUpload && <TextPreview resume={lastUpload} />}

      <div className="mt-10">
        <ResumeList key={refreshKey} />
      </div>
    </div>
  );
}