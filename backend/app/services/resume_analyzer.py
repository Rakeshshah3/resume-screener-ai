import json

from groq import Groq

from app.config import settings


client = Groq(
    api_key=settings.GROQ_API_KEY
)


def analyze_resume(resume_text: str):

    prompt = f"""
You are an expert ATS (Applicant Tracking System) Resume Reviewer.

Analyze the following resume as if it is being screened for a Data Science / Machine Learning / AI Engineer role.

Return ONLY valid JSON.

The JSON format must be:

{{
    "ats_score": 0,
    "strengths": [],
    "weaknesses": [],
    "missing_skills": [],
    "suggestions": []
}}

Rules:
- ATS score must be an integer between 0 and 100.
- Evaluate technical skills.
- Evaluate projects.
- Evaluate education.
- Evaluate certifications.
- Evaluate resume formatting.
- Evaluate keyword optimization.
- Evaluate achievements.
- Mention missing skills relevant to Data Science and Machine Learning roles.
- Give practical suggestions to improve the resume.
- Do NOT return markdown.
- Do NOT wrap the JSON inside ```json blocks.
- Return ONLY the JSON object.

Resume:

{resume_text}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    content = response.choices[0].message.content.strip()

    # Remove markdown if the model still returns it
    content = content.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "error": "Invalid JSON returned by AI",
            "raw_response": content
        }