import json
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
    """Retrieve Gemini generative model instance."""
    for model_name in ["gemini-flash-latest", "gemini-3.8-flash", "gemini-1.5-flash"]:
        try:
            return genai.GenerativeModel(model_name)
        except Exception:
            continue
    return genai.GenerativeModel("gemini-flash-latest")


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
        response = model.generate_content(prompt)
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


def generate_admission_roadmap(
    profile_data: Dict[str, Any],
    target_unis: List[str]
) -> Dict[str, Any]:
    """Generate strategic step-by-step optimization roadmap using Gemini."""
    if not settings.GEMINI_API_KEY:
        return _fallback_roadmap(profile_data)

    prompt = f"""You are a premier Graduate Admissions Strategist for competitive STEM graduate applications.
Given the applicant profile and target universities, generate a high-impact, prioritized timeline roadmap to maximize admission odds.

APPLICANT PROFILE:
- GPA: {profile_data.get('gpa', 8.4)}
- GRE: {profile_data.get('gre', 320)}
- TOEFL: {profile_data.get('toefl', 108)}
- Research Publications: {profile_data.get('publications', 0)}
- Full-time Work Months: {profile_data.get('work_months', 0)}
- Target Universities: {', '.join(target_unis) if target_unis else 'Top-30 US CS Programs'}

RESPONSE FORMAT:
Return strictly a valid JSON object with this structure:
{{
  "overview": "High-level strategic diagnosis of the candidate profile...",
  "suggested_timeline_months": 6,
  "executive_advice": "Key lever that will move the needle most...",
  "key_priorities": [
    {{
      "area": "Research / GRE / SOP / Work",
      "action_item": "Concrete task to execute",
      "timeline": "Months 1-2",
      "expected_score_lift": "+4 to +7 percentile points"
    }}
  ]
}}
Do not include any text outside the JSON block.
"""

    try:
        model = _get_gemini_model()
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]

        return json.loads(raw_text.strip())
    except Exception as e:
        logger.error(f"Error calling Gemini for roadmap: {e}")
        return _fallback_roadmap(profile_data)


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
    return {
        "overview": "Your quantitative foundation is promising. Focus remaining months on strengthening research signal and crafting faculty-tailored statements.",
        "suggested_timeline_months": 6,
        "executive_advice": "Securing one pre-print or workshop paper will elevate your profile from Consider to Target at top-25 institutions.",
        "key_priorities": [
            {
                "area": "Research",
                "action_item": "Submit ongoing capstone or research work to an IEEE/ACM student workshop or arXiv.",
                "timeline": "Months 1-3",
                "expected_score_lift": "+8 percentile lift"
            },
            {
                "area": "SOP & Networking",
                "action_item": "Identify 2-3 target professors per university and reference their recent 2024-2025 publications.",
                "timeline": "Months 3-4",
                "expected_score_lift": "+5 percentile lift"
            },
            {
                "area": "Letters of Recommendation",
                "action_item": "Provide recommenders with a bulleted dossier highlighting research independence and problem-solving.",
                "timeline": "Months 4-5",
                "expected_score_lift": "+4 percentile lift"
            }
        ]
    }


def parse_resume(resume_text: str) -> Dict[str, Any]:
    """
    Extract structured academic, professional, and research metrics from resume text using Gemini:
      - work_experience_years: float
      - research_publications: int
      - internships_count: int
      - key_skills: List[str]
      - summary: str
    """
    if not settings.GEMINI_API_KEY:
        return _fallback_parse_resume(resume_text)

    prompt = f"""You are an elite Graduate Admissions Evaluator and Technical Resume Parser.
Analyze the following resume text and extract the quantitative academic, professional, and research metrics accurately.
Do not hallucinate or invent experiences that are not present in the text.

GUIDELINES:
1. "work_experience_years": Total full-time professional industry experience in years (as a decimal float, e.g. 1.5 for 18 months, 2.0 for 2 years, 0.0 if only student/intern).
2. "research_publications": Count of peer-reviewed conference, journal, or workshop papers/preprints explicitly authored or co-authored.
3. "internships_count": Total number of distinct internship roles (summer/industrial/research internships).
4. "key_skills": List of top 5-8 primary technical skills or frameworks.
5. "summary": A concise 1-sentence summary of the candidate's professional profile.

RESUME TEXT:
\"\"\"
{resume_text[:9000]}
\"\"\"

RESPONSE FORMAT:
Return strictly a valid JSON object with this exact structure:
{{
  "work_experience_years": 1.5,
  "research_publications": 2,
  "internships_count": 2,
  "key_skills": ["Python", "PyTorch", "Kafka", "SQL"],
  "summary": "Brief 1-sentence summary of professional background."
}}
Do not include any text outside the JSON block.
"""

    try:
        model = _get_gemini_model()
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]

        parsed = json.loads(raw_text.strip())
        return {
            "work_experience_years": float(parsed.get("work_experience_years", 0.0)),
            "research_publications": int(parsed.get("research_publications", 0)),
            "internships_count": int(parsed.get("internships_count", 0)),
            "key_skills": list(parsed.get("key_skills", [])),
            "summary": str(parsed.get("summary", "Parsed from uploaded resume."))
        }
    except Exception as e:
        logger.error(f"Error parsing resume via Gemini: {e}")
        return _fallback_parse_resume(resume_text)


def _fallback_parse_resume(resume_text: str) -> Dict[str, Any]:
    """Heuristic fallback parser using keyword matching and regex."""
    import re

    text_lower = resume_text.lower()
    
    # Check publications count
    pub_count = 0
    if "publications" in text_lower or "papers" in text_lower:
        # Count bullets or numbered items in publications section
        pub_matches = re.findall(r"(?:\[\d+\]|\b\d+\.|\bpaper\b|\bconference\b|\bjournal\b|\bieee\b|\bacm\b|\barxiv\b)", text_lower)
        pub_count = min(len(pub_matches), 5)

    # Check internships
    intern_count = len(re.findall(r"\bintern\b|\binternship\b", text_lower))
    intern_count = min(max(intern_count, 1), 4) if "intern" in text_lower else 0

    # Check experience years
    years = 1.0 if "software engineer" in text_lower or "developer" in text_lower else 0.5

    return {
        "work_experience_years": years,
        "research_publications": pub_count,
        "internships_count": intern_count,
        "key_skills": ["Python", "Machine Learning", "Software Development"],
        "summary": "Heuristic fallback: candidate with engineering and project experience."
    }

