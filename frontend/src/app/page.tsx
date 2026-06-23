// src/app/page.tsx

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 text-center">
      <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 max-w-3xl">
        AI-Powered Resume Analysis
      </h1>
      <p className="text-gray-400 text-base sm:text-lg max-w-2xl mb-8">
        Upload your resume and get instant, actionable feedback powered by
        large language models. Land your dream job faster.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
        <Link
          href="/register"
          className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold text-lg text-center"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="border border-gray-600 hover:border-gray-400 px-8 py-3 rounded-lg font-semibold text-lg text-center"
        >
          Sign In
        </Link>
      </div>

      {/* Social proof */}
      <div className="mt-12 grid grid-cols-3 gap-6 sm:gap-12 text-center">
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-blue-400">500+</p>
          <p className="text-gray-500 text-xs sm:text-sm">Users</p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-green-400">10K+</p>
          <p className="text-gray-500 text-xs sm:text-sm">Resumes Analyzed</p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-purple-400">85+</p>
          <p className="text-gray-500 text-xs sm:text-sm">Avg Score</p>
        </div>
      </div>
    </div>
  );
}