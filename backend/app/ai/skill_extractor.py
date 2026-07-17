SKILLS = [
    "Python",
    "SQL",
    "Machine Learning",
    "Deep Learning",
    "FastAPI",
    "Docker",
    "Git",
    "GitHub",
    "Power BI",
    "Scikit-learn",
    "Pandas",
    "NumPy",
    "Java",
    "C++",
    "JavaScript",
    "HTML",
    "CSS"
]


def extract_skills(text: str):
    found = []

    text = text.lower()

    for skill in SKILLS:
        if skill.lower() in text:
            found.append(skill)

    return found