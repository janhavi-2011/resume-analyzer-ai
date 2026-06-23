// src/components/PlanBadge.tsx

"use client";

import { useState } from "react";
import { upgradeToPro, downgradeToFree } from "@/api/analytics";
import { PlanInfo } from "@/types";

interface PlanBadgeProps {
  plan: PlanInfo | null;
  onPlanChange: () => void;
}

export default function PlanBadge({ plan, onPlanChange }: PlanBadgeProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!plan) return null;

  const isPro = plan.plan === "pro";

  const handleUpgrade = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await upgradeToPro();
      setMessage(result.message);
      onPlanChange();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Upgrade failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await downgradeToFree();
      setMessage(result.message);
      onPlanChange();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Downgrade failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Badge */}
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
          isPro
            ? "bg-purple-900/30 border border-purple-600 text-purple-300 hover:bg-purple-900/50"
            : "bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isPro ? "bg-purple-400" : "bg-gray-400"}`} />
        {isPro ? "PRO" : "FREE"}
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Your Plan</h2>
              <button
                onClick={() => { setShowModal(false); setMessage(""); }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Current Plan Info */}
            <div className={`rounded-xl p-4 mb-6 ${isPro ? "bg-purple-900/20 border border-purple-700" : "bg-gray-800 border border-gray-700"}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg font-bold ${isPro ? "text-purple-300" : "text-gray-200"}`}>
                  {isPro ? "⚡ Pro Plan" : "🆓 Free Plan"}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                {plan.plan_label} — {plan.used} used, {plan.remaining} remaining
              </p>
            </div>

            {/* Plans Comparison */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Free */}
              <div className={`rounded-xl p-4 border ${!isPro ? "border-blue-500 bg-blue-900/10" : "border-gray-700 bg-gray-800"}`}>
                <h3 className="font-semibold mb-1">Free</h3>
                <p className="text-2xl font-bold mb-2">$0<span className="text-sm text-gray-400">/mo</span></p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>✓ 3 analyses / month</li>
                  <li>✓ Score + sections</li>
                  <li>✓ PDF export</li>
                  <li className="text-gray-600">✗ JD matching</li>
                  <li className="text-gray-600">✗ Keyword gap</li>
                </ul>
              </div>

              {/* Pro */}
              <div className={`rounded-xl p-4 border ${isPro ? "border-purple-500 bg-purple-900/10" : "border-gray-700 bg-gray-800"}`}>
                <h3 className="font-semibold mb-1">Pro</h3>
                <p className="text-2xl font-bold mb-2">$0<span className="text-sm text-gray-400">/mo</span></p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>✓ 30 analyses / day</li>
                  <li>✓ Score + sections</li>
                  <li>✓ PDF export</li>
                  <li>✓ JD matching</li>
                  <li>✓ Keyword gap</li>
                </ul>
              </div>
            </div>

            <p className="text-gray-500 text-xs text-center mb-4">
              🎓 Both tiers are free during development. In production, Pro would be $9/mo via Stripe.
            </p>

            {/* Action Button */}
            {isPro ? (
              <button
                onClick={handleDowngrade}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-sm disabled:opacity-50"
              >
                {loading ? "Processing..." : "Downgrade to Free"}
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm disabled:opacity-50"
              >
                {loading ? "Processing..." : "⚡ Upgrade to Pro (Free Demo)"}
              </button>
            )}

            {message && (
              <p className="text-center text-sm mt-3 text-green-400">{message}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}