from typing import Optional
from pymongo import MongoClient
from app.core.config import settings

_mongo_client: Optional[MongoClient] = None


def get_mongo_client() -> MongoClient:
    """Retrieve or initialize singleton PyMongo client."""
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = MongoClient(settings.effective_mongo_uri, serverSelectionTimeoutMS=5000)
    return _mongo_client


def get_mongo_db():
    """Retrieve MongoDB database instance."""
    client = get_mongo_client()
    return client[settings.MONGO_DB_NAME]


def get_mongo_collection(collection_name: str):
    """Retrieve specific MongoDB collection."""
    db = get_mongo_db()
    return db[collection_name]
