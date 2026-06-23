# app/utils/analysis_parser.py

import re
import logging

logger = logging.getLogger(__name__)


def parse_score_from_text(text: str) -> int | None:
    """Extract the score number from the analysis text."""
    match = re.search(r"### SCORE:\s*(\d{1,3})", text)
    if match:
        score = int(match.group(1))
        return min(max(score, 0), 100)  # Clamp 0-100
    return None


def parse_sections(text: str) -> dict:
    """Parse the analysis text into named sections."""
    section_names = [
        "STRENGTHS",
        "WEAKNESSES",
        "KEYWORD MATCH",
        "SUGGESTIONS",
        "SKILLS GAP",
        "FORMATTING TIPS",
        "SUMMARY",
    ]

    sections = {}

    for i, name in enumerate(section_names):
        # Match from "### NAME" to the next "### " or end of text
        pattern = rf"### {re.escape(name)}\s*\n([\s\S]*?)(?=### |$)"
        match = re.search(pattern, text)
        if match:
            sections[name] = match.group(1).strip()

    return sections


def get_score_color(score: int) -> str:
    """Return a color label based on score."""
    if score >= 81:
        return "excellent"
    elif score >= 61:
        return "good"
    elif score >= 41:
        return "fair"
    return "poor"


# ───────── NEW: KEYWORD GAP PARSER ─────────

def parse_keyword_gap(sections: dict) -> dict | None:
    """
    Parse the KEYWORD MATCH section into structured keyword data.
    Extracts matched keywords, missing keywords, and match percentage.
    """
    keyword_text = sections.get("KEYWORD MATCH", "")
    if not keyword_text:
        return None

    matched = []
    missing = []
    match_percentage = None

    # Try to extract match percentage
    percentage_patterns = [
        r"(?:match|alignment|fit)\s*(?:percentage|rate|score)?[:\s]*(\d{1,3})%",
        r"(\d{1,3})%\s*(?:match|alignment|fit)",
        r"(\d{1,3})%",
    ]

    for pattern in percentage_patterns:
        match = re.search(pattern, keyword_text, re.IGNORECASE)
        if match:
            match_percentage = min(int(match.group(1)), 100)
            break

    # Try to extract keyword lists
    # Look for bullet points or numbered lists after keywords like "present", "appear", "found"
    lines = keyword_text.split("\n")

    current_list = None

    for line in lines:
        line_lower = line.lower().strip()

        # Detect which list we're in
        if any(phrase in line_lower for phrase in [
            "keyword.*appear", "keyword.*present", "keyword.*found",
            "matching keyword", "present in", "found in",
            "keywords that appear", "keywords present",
            "✅", "matched keyword"
        ]):
            current_list = "matched"

        elif any(phrase in line_lower for phrase in [
            "keyword.*missing", "keyword.*absent", "keyword.*not",
            "missing keyword", "absent from", "not found",
            "keywords that are missing", "keywords missing",
            "❌", "missing from"
        ]):
            current_list = "missing"

        # Extract items from bullet points
        bullet_match = re.match(r"\s*[-•*]\s*(.+)", line)
        number_match = re.match(r"\s*\d+[.)]\s*(.+)", line)

        item_match = bullet_match or number_match
        if item_match:
            item = item_match.group(1).strip()
            # Clean up the item
            item = re.sub(r"[*`]", "", item).strip()
            if item and len(item) < 100:
                if current_list == "matched":
                    matched.append(item)
                elif current_list == "missing":
                    missing.append(item)

    # If we couldn't parse structured lists, try a fallback:
    # Extract comma-separated items from lines containing skill-like words
    if not matched and not missing:
        for line in lines:
            line_stripped = line.strip()
            # Look for lines with comma-separated skills
            if "," in line_stripped and len(line_stripped) < 200:
                items = [i.strip().strip("*`") for i in line_stripped.split(",")]
                items = [i for i in items if i and len(i) < 50]

                line_lower = line_stripped.lower()
                if any(w in line_lower for w in ["missing", "absent", "not", "gap", "lack"]):
                    missing.extend(items)
                elif any(w in line_lower for w in ["present", "found", "match", "have", "include"]):
                    matched.extend(items)

    # Deduplicate
    matched = list(dict.fromkeys(matched))[:20]
    missing = list(dict.fromkeys(missing))[:20]

    return {
        "matched": matched,
        "missing": missing,
        "match_percentage": match_percentage,
        "raw_text": keyword_text,
    }