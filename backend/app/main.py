# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.database import engine, Base
from app.routes import auth as auth_routes
from app.models import User   # 👈 THIS (important)
from app.routes import resume as resume_routes
from app.routes import analysis as analysis_routes    # NEW
from app.routes import plan as plan_routes           # NEW

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ResumeAI API",
    description="AI-Powered Resume Analysis Platform",
    version="1.0.0",
)

# CORS — allow your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Include routes
app.include_router(auth_routes.router)
app.include_router(resume_routes.router)     # NEW
app.include_router(analysis_routes.router)     # NEW
app.include_router(plan_routes.router)       # NEW

@app.get("/")
def root():
    return {"message": "ResumeAI API is running 🚀"}


@app.get("/health")
def health():
    return {"status": "healthy"}