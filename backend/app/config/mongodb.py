# app/config/mongodb.py

from pymongo import MongoClient
from app.config.settings import settings

client = MongoClient(settings.MONGODB_URI)
db = client[settings.MONGODB_DB]

# Collections
resumes_collection = db["resumes"]
analyses_collection = db["analyses"]   

def get_mongo_db():
    return db