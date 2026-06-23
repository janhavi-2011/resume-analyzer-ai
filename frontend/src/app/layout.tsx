// src/app/layout.tsx
import ErrorBoundary from "@/components/ErrorBoundary";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResumeAI — AI-Powered Resume Analysis",
  description: "Analyze and optimize your resume with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        <Providers>
          <Navbar />
          <ErrorBoundary>
            <main>{children}</main>
          </ErrorBoundary>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1f2937",
                color: "#f3f4f6",
                border: "1px solid #374151",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#22c55e", secondary: "#1f2937" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#1f2937" },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}