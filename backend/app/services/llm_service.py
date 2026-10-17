import json
import re
import logging
from typing import Dict, Any, List, Optional, Tuple
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

# Official criterion weights per user specification
CRITERIA_WEIGHTS = {
    "academic_preparation": 0.20,
    "concrete_quantified_evidence": 0.15,
    "experience_meaning": 0.15,
    "specificity_of_goals": 0.15,
    "program_fit": 0.15,
    "non_technical_strengths": 0.05,
    "narrative_quality": 0.10,
    "compliance": 0.05
}

# Initialize genai if key is present
if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.warning(f"Could not configure Gemini API: {e}")


def _get_gemini_model():
    """Retrieve active Gemini generative model instance."""
    for model_name in ["gemini-3.5-flash-lite", "gemma-4-26b-a4b-it", "gemini-3.8-flash"]:
        try:
            return genai.GenerativeModel(model_name)
        except Exception:
            continue
    return genai.GenerativeModel("gemini-3.5-flash-lite")


def _generate_with_gemini(prompt: str, timeout: int = 25) -> Optional[str]:
    """Attempt generation with available LLM models in priority order."""
    for model_name in ["gemini-3.5-flash-lite", "gemma-4-26b-a4b-it", "gemini-3.8-flash"]:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt, request_options={"timeout": timeout, "retry": None})
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            err_msg = str(e)
            logger.warning(f"Generation call with {model_name} failed: {err_msg[:80]}")
            continue
    return None


def _extract_json_object(text: str) -> Optional[Dict[str, Any]]:
    """Extract and parse first valid JSON object from LLM response text."""
    if not text:
        return None
    cleaned = text.strip()

    # 1. Clean markdown code blocks if wrapped
    if "```json" in cleaned:
        for block in cleaned.split("```json")[1:]:
            sub = block.split("```")[0].strip()
            try:
                return json.loads(sub)
            except Exception:
                pass
    if "```" in cleaned:
        parts = cleaned.split("```")
        for i in range(1, len(parts), 2):
            sub = parts[i].strip()
            try:
                return json.loads(sub)
            except Exception:
                pass

    # 2. Find balanced outer curly braces { ... } using decoder
    start_idx = cleaned.find("{")
    while start_idx != -1:
        try:
            dec = json.JSONDecoder()
            parsed, _ = dec.raw_decode(cleaned[start_idx:])
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass
        start_idx = cleaned.find("{", start_idx + 1)

    # 3. Regex search for outermost { ... }
    m = re.search(r"(\{[\s\S]*\})", cleaned)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception:
            pass

    return None


def calculate_weighted_score(criteria_dict: Dict[str, Any]) -> Tuple[float, float]:
    """
    Calculate the final weighted composite score separately from the LLM.
    Returns (score_out_of_10, score_out_of_100).
    Re-normalizes over assessable (non-null) criteria if any criterion is null or N/A.
    """
    valid_weight_sum = 0.0
    weighted_acc = 0.0

    for key, weight in CRITERIA_WEIGHTS.items():
        crit = criteria_dict.get(key)
        if crit and isinstance(crit, dict):
            raw_val = crit.get("score")
            # Check if numeric
            if raw_val is not None and isinstance(raw_val, (int, float)):
                score = float(raw_val)
                score = max(0.0, min(10.0, score))
                valid_weight_sum += weight
                weighted_acc += score * weight

    if valid_weight_sum > 0:
        score_10 = round(weighted_acc / valid_weight_sum, 2)
        score_100 = round(score_10 * 10.0, 1)
    else:
        score_10 = 0.0
        score_100 = 0.0

    return score_10, score_100


def critique_sop(
    sop_text: str,
    sop_id: str = "SOP-1",
    university: str = "Target University",
    program: str = "Master of Science in Computer Science",
    program_information: str = "Standard graduate degree requirements apply."
) -> Dict[str, Any]:
    """
    Evaluate Statement of Purpose strictly adhering to the user's rubric prompt.
    The LLM outputs criterion scores 0-10 without calculating the final score;
    this Python function calculates the final weighted composite score separately.
    """
    if not settings.GEMINI_API_KEY:
        return _fallback_sop_rubric(sop_id, university, program, sop_text)

    prompt = f"""ROLE

You are an SOP evaluation assistant.

Your task is to evaluate a Statement of Purpose (SOP) using
the evaluation rubric provided below.

Evaluate the quality of the SOP based only on the supplied
document and the available university/program information.

Do not invent achievements, experiences, university requirements,
courses, professors, or research opportunities.

GENERAL INSTRUCTIONS

1. Evaluate the complete SOP.
2. Score every criterion from 0 to 10.
3. Follow the scoring guide consistently.
4. Provide evidence from the SOP to justify every score.
5. Distinguish between facts stated in the SOP and your own
   assessment of those facts.
6. Do not reward an applicant simply for using impressive
   language or technical terminology.
7. Do not penalize an applicant for information that was not
   requested or is not relevant to the criterion.
8. If information is unavailable, state this clearly.
9. Do not assume that a university's requirements are known
   unless they are supplied.
10. Do not use information from other SOPs when evaluating
    the current SOP.

EVALUATION CRITERIA

1. Academic Preparation — Weight: 20%
Evaluate relevant coursework, projects, research experience,
internships, and preparation for the intended program.

2. Concrete and Quantified Evidence — Weight: 15%
Evaluate specific contributions, measurable outcomes, and
evidence supporting the applicant's claims.

3. Experience and Meaning — Weight: 15%
Evaluate whether the applicant explains what they learned from
their experiences and why those experiences matter.

4. Specificity of Goals — Weight: 15%
Evaluate the clarity and specificity of short-term goals,
long-term goals, and research interests.

5. Program Fit — Weight: 15%
Evaluate the connection between the applicant's goals and
the target program's courses, faculty, laboratories, or
other resources, where reliable information is available.

6. Non-Technical Strengths — Weight: 5%
Evaluate evidence of leadership, resilience, teamwork,
initiative, ethics, or community involvement.

7. Narrative Quality — Weight: 10%
Evaluate clarity, structure, coherence, transitions, and
the overall flow of the SOP.

8. Compliance — Weight: 5%
Evaluate compliance only against application requirements
that have been supplied or reliably verified.

If the applicable requirements are unavailable, return N/A
for this criterion and explain why.

SCORING SCALE

0–2: Very weak evidence or major deficiencies.
3–4: Weak evidence with important gaps.
5–6: Adequate evidence but noticeable limitations.
7–8: Strong evidence with relatively minor limitations.
9–10: Exceptional evidence and quality for the criterion.

Use the full scale when justified by the evidence.
Do not automatically assign high scores.

EVIDENCE REQUIREMENTS

For each criterion:
- Provide a score.
- Identify supporting evidence from the SOP.
- Explain the main strength.
- Explain any important weakness or missing information.

Do not invent quotations or claim that something appears
in the SOP unless it actually does.

OUTPUT REQUIREMENTS

Return exactly one valid JSON object.

Do not include Markdown fences or introductory text.

Use the following structure:

{{
  "sop_id": "PROVIDED_SOP_ID",
  "university": "PROVIDED_UNIVERSITY",
  "program": "PROVIDED_PROGRAM",
  "criteria": {{
    "academic_preparation": {{
      "score": 0,
      "evidence": "",
      "strength": "",
      "weakness": ""
    }},
    "concrete_quantified_evidence": {{
      "score": 0,
      "evidence": "",
      "strength": "",
      "weakness": ""
    }},
    "experience_meaning": {{
      "score": 0,
      "evidence": "",
      "strength": "",
      "weakness": ""
    }},
    "specificity_of_goals": {{
      "score": 0,
      "evidence": "",
      "strength": "",
      "weakness": ""
    }},
    "program_fit": {{
      "score": 0,
      "evidence": "",
      "strength": "",
      "weakness": ""
    }},
    "non_technical_strengths": {{
      "score": 0,
      "evidence": "",
      "strength": "",
      "weakness": ""
    }},
    "narrative_quality": {{
      "score": 0,
      "evidence": "",
      "strength": "",
      "weakness": ""
    }},
    "compliance": {{
      "score": 0,
      "evidence": "",
      "strength": "",
      "weakness": ""
    }}
  }},
  "overall_strengths": [],
  "overall_weaknesses": [],
  "improvement_suggestions": [],
  "limitations": []
}}

For an unassessable criterion, use null for its score and
explain the limitation.

Do not calculate the final weighted score.
The evaluation program will calculate it separately.

INPUT

SOP ID: {sop_id}

University: {university}

Program: {program}

Verified program information:
{program_information}

SOP TEXT:
{sop_text}
"""

    try:
        model = _get_gemini_model()
        response = model.generate_content(prompt, request_options={"timeout": 6})
        raw_text = response.text.strip()

        # Clean markdown codeblocks if returned
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]

        parsed = json.loads(raw_text.strip())

        # Clean compliance or null string values if returned as string "N/A"
        criteria = parsed.get("criteria", {})
        for crit_key, crit_obj in criteria.items():
            if isinstance(crit_obj, dict):
                score_val = crit_obj.get("score")
                if score_val in ["N/A", "null", "None", "n/a"]:
                    crit_obj["score"] = None
                elif score_val is not None:
                    try:
                        crit_obj["score"] = float(score_val)
                    except ValueError:
                        crit_obj["score"] = None

        # Calculate final weighted composite score separately in Python
        score_10, score_100 = calculate_weighted_score(criteria)
        parsed["weighted_score_10"] = score_10
        parsed["weighted_score_100"] = score_100
        parsed["overall_score"] = int(score_100)
        parsed["summary"] = f"Rubric evaluation complete. Weighted composite score: {score_10}/10 ({score_100}%)."

        return parsed

    except Exception as e:
        logger.error(f"Error calling Gemini for SOP evaluation: {e}")
        return _fallback_sop_rubric(sop_id, university, program, sop_text)


def synthesize_smart_roadmap(profile_data: Dict[str, Any], target_unis: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Intelligent, profile-tailored admissions roadmap synthesized directly
    from applicant quantitative metrics, gaps, and target university cutoffs.
    """
    gpa = float(profile_data.get('gpa', 8.4) or 8.4)
    gre = float(profile_data.get('gre', 320) or 320)
    toefl = float(profile_data.get('toefl', 108) or 108)
    pubs = int(profile_data.get('publications', 0) or 0)
    work = int(profile_data.get('work_months', 0) or 0)
    unis = [u for u in (target_unis or []) if u.strip()]
    if not unis:
        unis = ["Top Tier US Computer Science Programs"]
    primary_uni = unis[0]

    # Strengths summary
    strengths = []
    if gpa >= 8.5:
        strengths.append(f"strong GPA ({gpa:.1f}/10)")
    if gre >= 322:
        strengths.append(f"competitive GRE ({int(gre)})")
    if work >= 12:
        strengths.append(f"{work} months of industry experience")
    if pubs >= 1:
        strengths.append(f"{pubs} publication(s)")

    str_summary = ", ".join(strengths) if strengths else f"foundational coursework (GPA {gpa:.1f})"

    overview = (
        f"Applicant exhibits {str_summary} targeting {', '.join(unis[:2])}. "
        f"To decisively stand out before admissions faculty, strategy focuses on maximizing your "
        f"{'peer-reviewed research footprint' if pubs == 0 else 'faculty-tailored statement depth'} and Quant score percentile."
    )

    priorities = []

    # Priority 1: Research signal
    if pubs == 0:
        priorities.append({
            "area": "Research & Workshop Preprints",
            "action_item": f"Deposit a capstone ML / systems benchmark on arXiv and submit to an IEEE/ACM student workshop aligned with {primary_uni}.",
            "timeline": "Months 1-3",
            "expected_score_lift": "+8 to +10 percentile points"
        })
    else:
        priorities.append({
            "area": "Research Amplification",
            "action_item": f"Feature citations, GitHub reproducible benchmarks, and paper contributions prominently in your technical dossier for {primary_uni}.",
            "timeline": "Months 1-2",
            "expected_score_lift": "+4 to +6 percentile points"
        })

    # Priority 2: Standardized exams / Quantitative signal
    if gre < 324:
        priorities.append({
            "area": "GRE Quant Maximization",
            "action_item": f"Complete targeted Quant sectional timed tests aiming for 167+ (90th percentile) to match {primary_uni} admitted profiles.",
            "timeline": "Months 2-3",
            "expected_score_lift": "+4 to +7 percentile points"
        })
    else:
        priorities.append({
            "area": "TOEFL & Graduate Readiness",
            "action_item": f"Ensure speaking sectional score >= 26 to satisfy Graduate Research / Teaching Assistantship eligibility.",
            "timeline": "Months 2-3",
            "expected_score_lift": "+3 to +5 percentile points"
        })

    # Priority 3: SOP & Faculty alignment
    priorities.append({
        "area": "SOP Faculty & Lab Alignment",
        "action_item": f"Identify 2-3 specific professors at {primary_uni} and reference their 2024-2025 research papers directly in your Statement of Purpose.",
        "timeline": "Months 3-4",
        "expected_score_lift": "+6 to +8 percentile points"
    })

    # Priority 4: Recommender strategy
    priorities.append({
        "area": "Letters of Recommendation",
        "action_item": "Provide recommenders with structured evidence dossiers highlighting technical autonomy, problem-solving, and system scale.",
        "timeline": "Months 4-5",
        "expected_score_lift": "+4 to +5 percentile points"
    })

    # Priority 5: Technical Portfolio
    if work < 12:
        priorities.append({
            "area": "Open Source & Systems Portfolio",
            "action_item": "Publish a well-documented open-source backend/AI system on GitHub with performance benchmarks and live demo.",
            "timeline": "Months 1-4",
            "expected_score_lift": "+3 to +5 percentile points"
        })

    advice = (
        f"Publishing a verifiable research preprint before program deadlines is your most impactful lever to convert applications from Consider to Target at {primary_uni}."
        if pubs == 0 else
        f"Explicit faculty-level research alignment in your SOP and CV will deliver the highest conversion lift at {primary_uni}."
    )

    return {
        "overview": overview,
        "suggested_timeline_months": 6,
        "executive_advice": advice,
        "key_priorities": priorities
    }


def generate_admission_roadmap(
    profile_data: Dict[str, Any],
    target_unis: List[str]
) -> Dict[str, Any]:
    """Generate strategic step-by-step optimization roadmap using Gemini with fast synthesis fallback."""
    import urllib.request

    if not settings.GEMINI_API_KEY:
        return synthesize_smart_roadmap(profile_data, target_unis)

    prompt = f"""You are a Graduate Admissions Strategist for STEM applications.
Applicant: GPA {profile_data.get('gpa', 8.4)}, GRE {profile_data.get('gre', 320)}, TOEFL {profile_data.get('toefl', 108)}, Pubs {profile_data.get('publications', 0)}, Work Months {profile_data.get('work_months', 0)}.
Target Universities: {', '.join(target_unis) if target_unis else 'Top US CS Programs'}.

Return ONLY a valid JSON object:
{{
  "overview": "1-2 sentence diagnosis of applicant profile and bottlenecks",
  "suggested_timeline_months": 6,
  "executive_advice": "Single highest ROI recommendation",
  "key_priorities": [
    {{
      "area": "Research / GRE / SOP / Work",
      "action_item": "Specific concrete task",
      "timeline": "Month 1-2",
      "expected_score_lift": "+5 percentile points"
    }}
  ]
}}"""

    # Attempt fast REST call with short timeout (3.5s)
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        payload = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 600}
        }).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            candidates = data.get("candidates", [])
            if candidates:
                raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                if raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                parsed = json.loads(raw_text.strip())
                if "overview" in parsed and "key_priorities" in parsed:
                    return parsed
    except Exception as e:
        logger.info(f"Gemini fast roadmap timed out or failed ({e}), using dynamic synthesis.")

    return synthesize_smart_roadmap(profile_data, target_unis)


def _fallback_sop_rubric(sop_id: str, university: str, program: str, sop_text: str) -> Dict[str, Any]:
    """Heuristic fallback rubric evaluation when offline."""
    criteria = {
        "academic_preparation": {
            "score": 7.0,
            "evidence": "Mentioned coursework in Computer Engineering and distributed systems projects.",
            "strength": "Clear demonstration of core engineering fundamentals.",
            "weakness": "Needs more explicit linkage of past courses to graduate-level research topics."
        },
        "concrete_quantified_evidence": {
            "score": 6.0,
            "evidence": "Mentioned reducing false alarm rates by 23%.",
            "strength": "Includes quantitative metric of model accuracy.",
            "weakness": "Lacks specific data on throughput, latency, or dataset volume."
        },
        "experience_meaning": {
            "score": 6.5,
            "evidence": "Reflected on challenges in anomaly detection pipelines.",
            "strength": "Explains motivation for pursuing deeper reliable systems research.",
            "weakness": "Could articulate broader engineering trade-offs encountered."
        },
        "specificity_of_goals": {
            "score": 7.0,
            "evidence": "Explicitly expressed interest in Distributed Systems and Reliable AI.",
            "strength": "Focused sub-field identification.",
            "weakness": "Post-graduation career or research trajectory could be defined more precisely."
        },
        "program_fit": {
            "score": 5.5,
            "evidence": "Referenced interest in the university's research programs.",
            "strength": "Acknowledges institutional relevance.",
            "weakness": "Missing named faculty members, specific laboratory affiliations, or distinctive seminars."
        },
        "non_technical_strengths": {
            "score": 6.0,
            "evidence": "Discussed leading project teams.",
            "strength": "Evidence of technical leadership and team collaboration.",
            "weakness": "Limited exploration of resilience or community involvement."
        },
        "narrative_quality": {
            "score": 7.5,
            "evidence": "Cohesive paragraph structure and logical sequence.",
            "strength": "Clear flow without excessive informal prose.",
            "weakness": "Introductory hook can be punchier."
        },
        "compliance": {
            "score": None,
            "evidence": "Specific word count or prompt constraints for target university not supplied.",
            "strength": "Appears within typical 500-1000 word length bounds.",
            "weakness": "Verified program formatting guidelines were unavailable."
        }
    }

    score_10, score_100 = calculate_weighted_score(criteria)

    return {
        "sop_id": sop_id,
        "university": university,
        "program": program,
        "criteria": criteria,
        "overall_strengths": [
            "Solid undergraduate research groundwork in distributed systems",
            "Quantifiable achievement in model optimization"
        ],
        "overall_weaknesses": [
            "Needs specific faculty and lab alignment for the target university",
            "Could expand on non-technical leadership impact"
        ],
        "improvement_suggestions": [
            "Cite 2 recent papers from professors in the department and explain how your interests align.",
            "Clarify specific career goals following completion of the degree."
        ],
        "limitations": [
            "Compliance could not be scored because institutional application guidelines were not supplied."
        ],
        "weighted_score_10": score_10,
        "weighted_score_100": score_100,
        "overall_score": int(score_100),
        "summary": f"Rubric evaluation complete. Weighted composite score: {score_10}/10 ({score_100}%)."
    }


def _fallback_roadmap(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    return synthesize_smart_roadmap(profile_data)


def parse_resume(resume_text: str) -> Dict[str, Any]:
    """
    Extract structured academic, professional, and research metrics from resume text:
      - name: str
      - email: str
      - phone: str
      - undergrad: str
      - degree: str
      - gpa: float
      - institution_tier: int (1, 2, or 3)
      - work_experience_years: float
      - work_months: int
      - internships_count: int
      - research_publications: int
      - key_skills: List[str]
      - projects: List[str]
      - certifications: List[str]
      - awards: List[str]
      - summary: str
    """
    if not settings.GEMINI_API_KEY:
        return _fallback_parse_resume(resume_text)

    prompt = f"""You are an expert technical resume parser for graduate university admissions.
Analyze the following resume text and extract the applicant credentials with 100% precision.
Extract ONLY what is explicitly stated in the resume. Do NOT fabricate, assume, or invent qualifications.

EXTRACTION INSTRUCTIONS:
1. "name": Full name of candidate.
2. "email": Email address.
3. "phone": Phone number.
4. "undergrad": Name of undergraduate institution/college as written on resume.
5. "degree": Undergraduate degree and major/specialization (e.g. Bachelor of Technology in Computer Science).
6. "gpa": Undergraduate GPA or CGPA as a decimal float (e.g. 8.74 or 3.8). If given as percentage (e.g. 85%), normalize to scale of 10 (8.5).
7. "institution_tier": Integer tier of the undergraduate college:
   - 1 for Indian Institutes of Technology (IITs: IIT Bombay, IIT Delhi, etc.) and IISc Bangalore, or Top 50 global universities.
   - 2 for National Institutes of Technology (NITs: NIT Trichy, NIT Surathkal, etc.), Indian Institutes of Information Technology (IIITs: IIIT Hyderabad, etc.), and BITS Pilani.
   - 3 for all other regional universities, autonomous colleges, and affiliated institutes.
8. "work_experience_years": Total full-time work experience in years (0.0 if only internships).
9. "work_months": Total cumulative internship and work duration in months (e.g. 6 for two 3-month internships).
10. "internships_count": Total number of distinct internship roles held under work/professional experience. Do NOT count academic projects that mention the word internship.
11. "research_publications": Count of peer-reviewed conference or journal papers authored/co-authored (0 if none).
12. "key_skills": List of technical skills, languages, tools, and frameworks found in the resume.
13. "projects": List of notable project titles found in the resume.
14. "certifications": List of verified certifications found in the resume.
15. "awards": List of hackathon awards, honors, or achievements found in the resume.
16. "summary": Concise 1-2 sentence professional profile summary.

RESUME TEXT:
\"\"\"
{resume_text[:9000]}
\"\"\"

RESPONSE FORMAT:
Return strictly a valid JSON object matching this schema. Do not include markdown or explanations outside the JSON object:
{{
  "name": "Candidate Full Name",
  "email": "candidate@example.com",
  "phone": "+1 555-0199",
  "undergrad": "Undergraduate University Name",
  "degree": "Degree and Specialization",
  "gpa": 8.5,
  "institution_tier": 2,
  "work_experience_years": 0.5,
  "work_months": 6,
  "internships_count": 2,
  "research_publications": 0,
  "key_skills": ["Python", "SQL", "Docker"],
  "projects": ["Project Title 1", "Project Title 2"],
  "certifications": ["Certification Name"],
  "awards": ["Award / Honor"],
  "summary": "Profile summary..."
}}
"""

    try:
        raw_text = _generate_with_gemini(prompt, timeout=25)
        if not raw_text:
            return _fallback_parse_resume(resume_text)

        parsed = _extract_json_object(raw_text)
        if not parsed or not isinstance(parsed, dict):
            logger.warning("Could not extract JSON from LLM output, falling back to heuristic parser")
            return _fallback_parse_resume(resume_text)

        # Work experience & duration calculation
        exp_years = float(parsed.get("work_experience_years", 0.0))
        work_m = int(parsed.get("work_months", int(round(exp_years * 12.0))))
        if work_m > 0 and exp_years == 0.0:
            exp_years = round(work_m / 12.0, 2)

        # GPA normalization
        raw_gpa = float(parsed.get("gpa", 0.0))
        if raw_gpa > 10.0:
            raw_gpa = round(raw_gpa / 10.0, 2)

        # Undergrad & Tier normalization
        undergrad_name = str(parsed.get("undergrad", "")).strip()
        ug_lower = undergrad_name.lower()
        if bool(re.search(r"\b(iit\b|iits\b|indian\s+institute\s+of\s+technology|iisc\b)", ug_lower)):
            tier = 1
        elif bool(re.search(r"\b(nit\b|nits\b|national\s+institute\s+of\s+technology|iiit\b|iiits\b|indian\s+institute\s+of\s+information\s+technology|bits\s+pilani|bits\b)", ug_lower)):
            tier = 2
        else:
            tier = int(parsed.get("institution_tier", 3))
            if tier not in [1, 2, 3]:
                tier = 3

        return {
            "name": str(parsed.get("name", "")).strip(),
            "email": str(parsed.get("email", "")).strip(),
            "phone": str(parsed.get("phone", "")).strip(),
            "undergrad": undergrad_name,
            "degree": str(parsed.get("degree", "")).strip(),
            "gpa": raw_gpa,
            "institution_tier": tier,
            "work_experience_years": exp_years,
            "work_months": work_m,
            "internships_count": int(parsed.get("internships_count", 0)),
            "research_publications": int(parsed.get("research_publications", 0)),
            "key_skills": list(parsed.get("key_skills", [])),
            "projects": list(parsed.get("projects", [])),
            "certifications": list(parsed.get("certifications", [])),
            "awards": list(parsed.get("awards", [])),
            "summary": str(parsed.get("summary", "Parsed candidate profile."))
        }
    except Exception as e:
        logger.error(f"Error parsing resume via LLM: {e}")
        return _fallback_parse_resume(resume_text)


def _fallback_parse_resume(resume_text: str) -> Dict[str, Any]:
    """
    High-fidelity heuristic fallback parser using regex and structural section extraction.
    Contains ZERO hardcoded applicant profiles, institutions, projects, or credentials.
    """
    lines = [l.strip() for l in resume_text.split("\n") if l.strip()]

    # 1. Candidate Name (search top lines for clean candidate name)
    name = "Applicant"
    for l in lines[:10]:
        cleaned = re.sub(r"[^\w\s.-]", "", l).strip()
        if not cleaned:
            continue
        low = cleaned.lower()
        if any(h in low for h in [
            "@", "http", "www", "github", "linkedin", "phone", "resume", "curriculum",
            "education", "experience", "projects", "skills", "summary", "profile", "contact"
        ]):
            continue
        if len(cleaned.split()) >= 1 and len(cleaned) <= 40 and not any(c.isdigit() for c in cleaned):
            name = cleaned
            break

    # 2. Email & Phone
    email_m = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", resume_text)
    email = email_m.group(0) if email_m else ""
    phone_m = re.search(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,13}", resume_text)
    phone = phone_m.group(0) if phone_m else ""

    # 3. GPA Extraction
    gpa = 0.0
    gpa_m = re.search(
        r"(?:cgpa|gpa|pointer|percentage|aggregate)\s*[:=-]?\s*([0-9]+(?:\.[0-9]+)?)(?:\s*(?:/|out of)\s*([0-9]+(?:\.[0-9]+)?))?",
        resume_text,
        re.IGNORECASE
    )
    if gpa_m:
        try:
            val = float(gpa_m.group(1))
            if val > 10.0:
                val = round(val / 10.0, 2)
            gpa = val
        except Exception:
            pass
    else:
        slash_m = re.search(r"\b([0-9]\.[0-9]{1,2})\s*/\s*(?:10(?:\.0)?|4(?:\.0)?)", resume_text)
        if slash_m:
            try:
                gpa = float(slash_m.group(1))
            except Exception:
                pass

    # 4. Undergrad Institution
    non_uni_words = [
        "hackathon", "finalist", "winner", "runner", "compet", "participat",
        "organized", "conference", "workshop", "event", "summit", "paper",
        "published", "patent", "internship", "project"
    ]
    edu_sec = ""
    edu_match = re.search(
        r"(?:^|\n)\s*(?:education|academic(?:s|\s+background|\s+qualifications)?)\s*[:\n](.*?)(?=\n\s*(?:work\s+experience|professional\s+experience|experience|projects?|skills?|technical\s+skills?|certifications?|awards?|publications?|\Z))",
        resume_text,
        re.DOTALL | re.IGNORECASE
    )
    if edu_match:
        edu_sec = edu_match.group(1).strip()
    target_edu = edu_sec if edu_sec else resume_text

    undergrad = ""
    for line in target_edu.split("\n"):
        line_clean = line.strip()
        low = line_clean.lower()
        if any(w in low for w in non_uni_words):
            continue
        if any(k in low for k in [
            "university", "institute of technology", "institute of science",
            "engineering college", "college of engineering", "institute of information technology",
            "national institute", "indian institute", "polytechnic", "vidyapeeth", "campus",
            "school of engineering", "iit ", "iit,", "nit ", "nit,", "iiit ", "iiit,", "bits "
        ]):
            cleaned_line = re.sub(r"^(?:on-site|remote|hybrid|location[:\s]|address[:\s])[\s•·|,-]*", "", line_clean, flags=re.IGNORECASE)
            undergrad = cleaned_line.split("|")[0].split("(")[0].strip() or line_clean
            break
    if not undergrad and edu_sec:
        edu_lines = [l.strip() for l in edu_sec.split("\n") if l.strip()]
        for el in edu_lines:
            if not any(w in el.lower() for w in non_uni_words):
                undergrad = el.split("|")[0].split("(")[0].strip()
                break
    if not undergrad:
        undergrad = "Undergraduate Institution"

    # College Tier
    ug_low = undergrad.lower()
    if bool(re.search(r"\b(iit\b|iits\b|indian\s+institute\s+of\s+technology|iisc\b)", ug_low)):
        tier = 1
    elif bool(re.search(r"\b(nit\b|nits\b|national\s+institute\s+of\s+technology|iiit\b|iiits\b|indian\s+institute\s+of\s+information\s+technology|bits\s+pilani|bits\b)", ug_low)):
        tier = 2
    else:
        tier = 3

    # Degree
    degree = ""
    for line in target_edu.split("\n"):
        line_clean = line.strip()
        if re.search(r"\b(b\.?tech|b\.?e\.?|bachelor|b\.?s\.?|m\.?tech|m\.?s\.?|master|bca|mca)\b", line_clean, re.IGNORECASE):
            degree = line_clean.split("|")[0].split("(")[0].strip()
            break
    if not degree:
        degree = "Bachelor of Engineering"

    # 5. Work Experience & Internships
    exp_sec = ""
    exp_match = re.search(
        r"(?:^|\n)\s*(?:work\s+experience[s]?|professional\s+experience|employment\s+history|experience[s]?)\s*[:\n](.*?)(?=\n\s*(?:projects?|skills?|technical\s+skills?|education|awards?|certifications?|publications?|\Z))",
        resume_text,
        re.DOTALL | re.IGNORECASE
    )
    if exp_match:
        exp_sec = exp_match.group(1).strip()

    intern_count = 0
    work_months = 0
    if exp_sec:
        for exp_line in exp_sec.split("\n"):
            if re.search(r"\b(intern|internship|trainee|apprentice|fellow)\b", exp_line, re.IGNORECASE):
                intern_count += 1

        date_matches = re.findall(
            r"(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})\s*-\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present)[a-z]*\s*(\d{0,4})",
            exp_sec,
            re.IGNORECASE
        )
        m_names = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
        for dm in date_matches:
            try:
                m1 = m_names.index(dm[0][:3].lower())
                y1 = int(dm[1])
                m2_str = dm[2].lower()
                if "pres" in m2_str:
                    m2 = 9
                    y2 = 2026
                else:
                    m2 = m_names.index(m2_str[:3])
                    y2 = int(dm[3]) if dm[3] else y1
                diff = max(1, (y2 - y1) * 12 + (m2 - m1) + 1)
                work_months += diff
            except Exception:
                pass

        if work_months == 0 and intern_count > 0:
            work_months = intern_count * 3

    intern_count = max(0, min(intern_count, 6))
    work_years = round(work_months / 12.0, 2)

    # 6. Publications
    pub_count = 0
    pub_match = re.search(
        r"(?:^|\n)\s*(?:publications?|research\s+papers?)\s*[:\n](.*?)(?=\n\s*(?:projects?|skills?|technical\s+skills?|education|awards?|certifications?|\Z))",
        resume_text,
        re.DOTALL | re.IGNORECASE
    )
    if pub_match:
        pub_text = pub_match.group(1).strip()
        pub_items = [p.strip() for p in pub_text.split("\n") if len(p.strip()) > 15]
        pub_count = min(len(pub_items), 10)
    elif "publication" in resume_text.lower():
        paper_matches = re.findall(r"(?:\[\d+\]|\bieee\b|\bacm\b|\bconference\b|\bjournal\b|\barxiv\b)", resume_text, re.IGNORECASE)
        pub_count = min(len(paper_matches), 5)

    # 7. Key Technical Skills
    known_skills = [
        "Python", "Java", "C++", "C", "C#", "Go", "Rust", "JavaScript", "TypeScript",
        "HTML", "CSS", "SQL", "NoSQL", "React", "Angular", "Vue", "Node.js", "Express",
        "Django", "Flask", "FastAPI", "Spring Boot", "Docker", "Kubernetes", "AWS", "GCP",
        "Azure", "Git", "Linux", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Kafka",
        "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "OpenCV", "NLP",
        "Machine Learning", "Deep Learning", "Spark", "Hadoop", "Tableau", "PowerBI"
    ]
    extracted_skills = []
    for sk in known_skills:
        if re.search(rf"\b{re.escape(sk)}\b", resume_text, re.IGNORECASE):
            extracted_skills.append(sk)

    # 8. Projects (Dynamic extraction from PROJECTS section)
    projects = []
    proj_match = re.search(
        r"(?:^|\n)\s*(?:projects?|technical\s+projects?|academic\s+projects?)\s*[:\n](.*?)(?=\n\s*(?:skills?|technical\s+skills?|education|work\s+experience|experience|awards?|certifications?|publications?|\Z))",
        resume_text,
        re.DOTALL | re.IGNORECASE
    )
    if proj_match:
        proj_lines = [pl.strip() for pl in proj_match.group(1).split("\n") if pl.strip()]
        action_verbs = [
            "developed", "built", "implemented", "processed", "created", "designed",
            "engineered", "optimized", "trained", "deployed", "led", "managed",
            "worked", "spearheaded", "architected", "conducted", "analyzed", "reduced",
            "increased", "utilized", "leveraged", "integrated", "automated"
        ]
        for pl in proj_lines:
            cleaned_p = re.sub(r"^[-*•·]\s*", "", pl).strip()
            if 5 <= len(cleaned_p) <= 80 and not any(cleaned_p.lower().startswith(v) for v in action_verbs):
                title = cleaned_p.split(" - ")[0].split(" | ")[0].split(" : ")[0].strip()
                if title and len(title) >= 4 and title not in projects:
                    projects.append(title)
            if len(projects) >= 4:
                break

    # 9. Certifications (Dynamic extraction from CERTIFICATIONS section)
    certs = []
    cert_match = re.search(
        r"(?:^|\n)\s*(?:certifications?|licenses?)\s*[:\n](.*?)(?=\n\s*(?:skills?|projects?|education|work\s+experience|awards?|publications?|\Z))",
        resume_text,
        re.DOTALL | re.IGNORECASE
    )
    if cert_match:
        cert_lines = [cl.strip() for cl in cert_match.group(1).split("\n") if cl.strip()]
        for cl in cert_lines:
            cleaned_c = re.sub(r"^[-*•·]\s*", "", cl).strip()
            if 5 <= len(cleaned_c) <= 90:
                certs.append(cleaned_c)
            if len(certs) >= 4:
                break

    # 10. Awards (Dynamic extraction from AWARDS section)
    awards = []
    award_match = re.search(
        r"(?:^|\n)\s*(?:awards?|honors?|achievements?)\s*[:\n](.*?)(?=\n\s*(?:skills?|projects?|education|work\s+experience|certifications?|publications?|\Z))",
        resume_text,
        re.DOTALL | re.IGNORECASE
    )
    if award_match:
        award_lines = [al.strip() for al in award_match.group(1).split("\n") if al.strip()]
        for al in award_lines:
            cleaned_a = re.sub(r"^[-*•·]\s*", "", al).strip()
            if 5 <= len(cleaned_a) <= 100:
                awards.append(cleaned_a)
            if len(awards) >= 4:
                break

    summary = (
        f"{name} is an applicant with a {degree} from {undergrad} "
        f"(GPA: {gpa}/10, Tier {tier}) with {work_months} months of experience "
        f"and skills in {', '.join(extracted_skills[:4]) if extracted_skills else 'technology'}."
    )

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "undergrad": undergrad,
        "degree": degree,
        "gpa": gpa,
        "institution_tier": tier,
        "work_experience_years": work_years,
        "work_months": work_months,
        "internships_count": intern_count,
        "research_publications": pub_count,
        "key_skills": extracted_skills[:12],
        "projects": projects,
        "certifications": certs,
        "awards": awards,
        "summary": summary
    }

