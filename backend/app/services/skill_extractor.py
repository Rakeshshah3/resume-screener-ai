import re

# 🚀 Complete keyword registry mapped to clean, standardized return strings
SKILL_MAP = {
    # Web Core & Frontend
    "html": "HTML",
    "html5": "HTML5",
    "css": "CSS",
    "css3": "CSS3",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "tailwind": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    
    # Backend Frameworks & Runtimes
    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "express": "Express.js",
    "express.js": "Express.js",
    "expressjs": "Express.js",
    "fastapi": "FastAPI",
    "flask": "Flask",
    "django": "Django",
    
    # Languages & Systems
    "python": "Python",
    "java": "Java",
    "c": "C",
    "c++": "C++",
    "linux": "Linux",
    
    # APIs & Paradigms
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "restful": "REST APIs",
    "graphql": "GraphQL",
    "jwt": "JWT Authentication",
    "jwt authentication": "JWT Authentication",
    "agile": "Agile",
    
    # Databases
    "sql": "SQL",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    
    # DevOps & Cloud Hosting
    "git": "Git",
    "github": "GitHub",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "aws": "AWS",
    "azure": "Azure",
    "gcp": "GCP",
    "vercel": "Vercel",
    "netlify": "Netlify",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    
    # AI / Data Science
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "nlp": "NLP",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scikit-learn": "Scikit-learn",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "power bi": "Power BI",
    "tableau": "Tableau",
    "langchain": "LangChain",
    "llm": "LLM",
    "openai": "OpenAI",
    "generative ai": "Generative AI"
}

def extract_skills(text: str) -> str:
    if not text:
        return ""

    found_skills = set()
    text_lower = text.lower()

    # Sort keywords by length descending so longer phrases match before sub-words
    # (e.g., matching "Tailwind CSS" instead of separate "CSS" triggers)
    sorted_keywords = sorted(SKILL_MAP.keys(), key=len, reverse=True)

    for keyword in sorted_keywords:
        escaped_keyword = re.escape(keyword)
        
        # 🚀 CUSTOM BOUNDARY STRATEGY: 
        # Instead of generic \b, we assert that the match is surrounded by non-alphanumeric chars or string edges.
        # This keeps characters like '+', '.', and '/' from breaking boundary constraints.
        pattern = rf"(?:^|[^a-zA-Z0-9_\+\.#/]){escaped_keyword}(?:$|[^a-zA-Z0-9_\+\.#/])"
        
        if re.search(pattern, text_lower):
            found_skills.add(SKILL_MAP[keyword])

    # Return as a clean, unified comma-separated string formatting block
    return ",".join(sorted(list(found_skills)))