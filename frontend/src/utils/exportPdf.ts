// src/utils/exportPdf.ts

import { AnalysisDetail } from "@/types";
import jsPDF from "jspdf";

export function exportAnalysisPdf(analysis: AnalysisDetail, resumeFilename: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // ── HELPER FUNCTIONS ──

  const addHeader = () => {
    doc.setFillColor(17, 24, 39); // gray-900
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ResumeAI Analysis Report", margin, 26);
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 34);
    y = 50;
  };

  const addScore = (score: number | null) => {
    if (score === null) return;

    const color = score >= 81 ? [34, 197, 94] : score >= 61 ? [234, 179, 8] : score >= 41 ? [249, 115, 22] : [239, 68, 68];
    const label = score >= 81 ? "Excellent" : score >= 61 ? "Good" : score >= 41 ? "Fair" : "Needs Work";

    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, y, 50, 30, 4, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(`${score}`, margin + 25, y + 17, { align: "center" });
    doc.setFontSize(8);
    doc.text("/ 100", margin + 25, y + 24, { align: "center" });

    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(label, margin + 58, y + 14);

    doc.setTextColor(156, 163, 175);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Resume: ${resumeFilename}`, margin + 58, y + 24);

    y += 40;
  };

  const addSection = (title: string, content: string, emoji: string) => {
    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246);
    doc.text(`${emoji} ${title}`, margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(209, 213, 219);

    const lines = doc.splitTextToSize(content, contentWidth);
    for (const line of lines) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 4.5;
    }
    y += 6;
  };

  // ── BUILD PDF ──

  addHeader();
  addScore(analysis.score);

  // Add sections
  const sectionConfig: Record<string, string> = {
    "STRENGTHS": "✅",
    "WEAKNESSES": "⚠️",
    "KEYWORD MATCH": "🎯",
    "SUGGESTIONS": "💡",
    "SKILLS GAP": "🔧",
    "FORMATTING TIPS": "📝",
    "SUMMARY": "📋",
  };

  if (analysis.sections) {
    for (const [key, content] of Object.entries(analysis.sections)) {
      const emoji = sectionConfig[key] || "📄";
      addSection(key.replace(/_/g, " "), content, emoji);
    }
  }

  // Footer on last page
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `ResumeAI — AI-Powered Resume Analysis | Model: ${analysis.model_used} | ${new Date(analysis.created_at).toLocaleDateString()}`,
    margin,
    285
  );

  // Save
  const filename = `resume-analysis-${resumeFilename.replace(".pdf", "")}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}