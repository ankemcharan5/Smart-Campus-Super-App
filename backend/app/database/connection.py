import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv(override=True)
_backend_env = Path(__file__).resolve().parent.parent.parent / ".env"
if _backend_env.exists():
    load_dotenv(dotenv_path=_backend_env, override=False)


MONGO_URI = os.getenv("MONGO_URI")

DATABASE_NAME = os.getenv("DATABASE_NAME") or os.getenv("DB_NAME") or "smart_campus"

if not MONGO_URI:
    raise ValueError("MONGO_URI is missing from .env")


client = MongoClient(
    MONGO_URI,
    tls=True,
    serverSelectionTimeoutMS=15000,
    connectTimeoutMS=15000,
)

db = client[DATABASE_NAME]


def check_database_connection():
    client.admin.command("ping")
    return True