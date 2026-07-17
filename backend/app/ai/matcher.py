def calculate_match(resume_skills: list, job_skills: list):
    resume_set = set(skill.strip().lower() for skill in resume_skills)
    job_set = set(skill.strip().lower() for skill in job_skills)

    matched = resume_set.intersection(job_set)
    missing = job_set - resume_set

    if len(job_set) == 0:
        match_percentage = 0
    else:
        match_percentage = round((len(matched) / len(job_set)) * 100, 2)

    return {
        "match_percentage": match_percentage,
        "matched_skills": sorted(list(matched)),
        "missing_skills": sorted(list(missing))
    }