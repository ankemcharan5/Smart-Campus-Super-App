import os

from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv(override=True)

MONGO_URI = os.getenv("MONGO_URI")

DATABASE_NAME = os.getenv(
    "DATABASE_NAME",
    "smart_campus"
)

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