# app/utils/pdf_parser.py

import pdfplumber
import io
import logging

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_bytes: bytes) -> dict:
    """
    Extract text from PDF bytes.
    Returns a dict with text, page_count, and metadata.
    """
    try:
        pdf_stream = io.BytesIO(file_bytes)
        full_text = ""
        page_count = 0
        page_texts = []

        with pdfplumber.open(pdf_stream) as pdf:
            page_count = len(pdf.pages)

            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text() or ""
                page_texts.append({
                    "page_number": i + 1,
                    "text": page_text.strip()
                })
                full_text += page_text + "\n"

        total_chars = len(full_text.strip())
        total_words = len(full_text.strip().split())

        # Warn if text seems too short (might be a scanned image PDF)
        if total_words < 20:
            logger.warning(f"PDF has only {total_words} words — may be image-based")

        return {
            "full_text": full_text.strip(),
            "page_count": page_count,
            "total_characters": total_chars,
            "total_words": total_words,
            "pages": page_texts,
            "is_parseable": total_words >= 20,
        }

    except Exception as e:
        logger.error(f"PDF parsing error: {str(e)}")
        return {
            "full_text": "",
            "page_count": 0,
            "total_characters": 0,
            "total_words": 0,
            "pages": [],
            "is_parseable": False,
            "error": str(e),
        }