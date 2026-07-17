from app.database.database import Base, engine

# Import all models
from app.models.user import User
from app.models.job import Job
from app.models.resume import Resume
from app.models.match import Match

Base.metadata.create_all(bind=engine)

print("Tables created successfully!")