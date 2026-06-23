# app/utils/prompts.py

SYSTEM_PROMPT = """You are an expert resume analyst and career coach with 15+ years of experience in recruitment. You provide detailed, honest, and actionable feedback on resumes. You evaluate resumes based on:
- Content quality and relevance
- Structure and formatting
- Impact statements and quantifiable achievements
- Keyword optimization
- Skills presentation
- Overall professional impression

Be specific, constructive, and thorough. Always provide actionable suggestions."""

ANALYSIS_PROMPT = """Analyze the following resume and provide a comprehensive evaluation.

RESUME TEXT:
---
{resume_text}
---
{jd_section}

Provide your analysis in EXACTLY this format. Keep all section headers exactly as written:

### SCORE: [a single number between 0 and 100]

### STRENGTHS
List 4-6 key strengths of this resume. Be specific about what works well and why.

### WEAKNESSES
List 3-5 areas that need improvement. Be honest, specific, and explain why each is a weakness.

### SUGGESTIONS
Provide 5-8 specific, actionable suggestions to improve this resume. Prioritize by impact (most important first). Use action verbs.

### SKILLS GAP
List specific skills, tools, certifications, or technologies that are missing but would strengthen this resume for the target role.

### FORMATTING TIPS
Give 2-3 specific formatting or structure improvements.

### SUMMARY
Write a 2-3 sentence overall assessment with the single most important action the person should take.

IMPORTANT RULES:
- The SCORE must be a single integer between 0-100 on the "### SCORE:" line
- Be critical but fair. A decent resume scores 60-75. A good resume scores 70-85. Only exceptional resumes score 90+
- Every weakness must have a corresponding suggestion
- Be specific — avoid generic advice like "use action verbs" without examples"""

JD_SECTION_TEMPLATE = """JOB DESCRIPTION:
---
{job_description}
---

IMPORTANT: Since a job description was provided, evaluate how well this resume matches it. Add a "### KEYWORD MATCH" section after "### WEAKNESSES" that analyzes:
- Which JD keywords appear in the resume
- Which JD keywords are missing
- Overall match percentage (estimate)
- Specific recommendations to better align with this role"""


def build_analysis_prompt(resume_text: str, job_description: str | None = None) -> str:
    """
    Build the full prompt for Gemini.
    
    Gemini uses a single combined string (system + user)
    rather than separate system/user messages like OpenAI.
    We combine everything into one clear prompt.
    """
    jd_section = ""
    if job_description and job_description.strip():
        jd_section = JD_SECTION_TEMPLATE.format(job_description=job_description.strip())

    user_prompt = ANALYSIS_PROMPT.format(
        resume_text=resume_text,
        jd_section=jd_section,
    )

    # Gemini: combine system + user into one message
    return f"{SYSTEM_PROMPT}\n\n{user_prompt}"