from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Union
from bson import ObjectId
from app.db.mongo import get_mongo_collection


def _serialize_mongo_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Convert MongoDB _id to string id and ensure JSON-serializable types."""
    if not doc:
        return None
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc


class MongoUserRepo:
    @staticmethod
    def get_collection():
        return get_mongo_collection("users")

    @classmethod
    def create_user(cls, email: str, hashed_password: str, full_name: Optional[str] = None) -> Dict[str, Any]:
        coll = cls.get_collection()
        now = datetime.now(timezone.utc)
        doc = {
            "email": email.lower(),
            "hashed_password": hashed_password,
            "full_name": full_name,
            "created_at": now,
            "updated_at": now
        }
        res = coll.insert_one(doc)
        doc["id"] = str(res.inserted_id)
        # Create default profile
        MongoProfileRepo.create_default_profile(doc["id"])
        return doc

    @classmethod
    def get_by_email(cls, email: str) -> Optional[Dict[str, Any]]:
        coll = cls.get_collection()
        doc = coll.find_one({"email": email.lower()})
        return _serialize_mongo_doc(doc)

    @classmethod
    def get_by_id(cls, user_id: Union[str, ObjectId]) -> Optional[Dict[str, Any]]:
        coll = cls.get_collection()
        try:
            oid = ObjectId(user_id) if isinstance(user_id, str) and len(user_id) == 24 else user_id
            doc = coll.find_one({"_id": oid})
        except Exception:
            doc = coll.find_one({"_id": user_id})
        return _serialize_mongo_doc(doc)


class MongoProfileRepo:
    @staticmethod
    def get_collection():
        return get_mongo_collection("profiles")

    @classmethod
    def create_default_profile(cls, user_id: str) -> Dict[str, Any]:
        coll = cls.get_collection()
        existing = coll.find_one({"user_id": str(user_id)})
        if existing:
            return _serialize_mongo_doc(existing)

        now = datetime.now(timezone.utc)
        doc = {
            "user_id": str(user_id),
            "is_onboarded": False,
            "undergrad": "",
            "degree": "",
            "institution_tier": 3,
            "target_program": "MS Computer Science",
            "intake": "Fall 2027",
            "gpa": 0.0,
            "gre": 0.0,
            "toefl": 0.0,
            "publications": 0,
            "work_months": 0,
            "internships": 0,
            "lor_strength": 0.0,
            "sop_quality": 0.0,
            "updated_at": now
        }
        res = coll.insert_one(doc)
        doc["id"] = str(res.inserted_id)
        return doc

    @classmethod
    def get_by_user_id(cls, user_id: str) -> Dict[str, Any]:
        coll = cls.get_collection()
        doc = coll.find_one({"user_id": str(user_id)})
        if not doc:
            return cls.create_default_profile(user_id)
        serialized = _serialize_mongo_doc(doc)
        if serialized and "is_onboarded" not in serialized:
            serialized["is_onboarded"] = bool(serialized.get("gpa", 0) > 0 and serialized.get("undergrad"))
        return serialized

    @classmethod
    def update_profile(cls, user_id: str, patch_data: Dict[str, Any]) -> Dict[str, Any]:
        coll = cls.get_collection()
        patch = {k: v for k, v in patch_data.items() if v is not None}
        patch["updated_at"] = datetime.now(timezone.utc)
        coll.update_one({"user_id": str(user_id)}, {"$set": patch}, upsert=True)
        return cls.get_by_user_id(user_id)


class MongoDocumentRepo:
    @staticmethod
    def get_collection():
        return get_mongo_collection("documents")

    @classmethod
    def create_document(
        cls,
        user_id: str,
        filename: str,
        file_type: str,
        size_kb: float,
        cloudinary_url: Optional[str],
        cloudinary_public_id: Optional[str],
        extracted_text: Optional[str]
    ) -> Dict[str, Any]:
        coll = cls.get_collection()
        now = datetime.now(timezone.utc)
        doc = {
            "user_id": str(user_id),
            "filename": filename,
            "file_type": file_type,
            "size_kb": size_kb,
            "cloudinary_url": cloudinary_url,
            "cloudinary_public_id": cloudinary_public_id,
            "extracted_text": extracted_text,
            "feedback_json": None,
            "status": "uploaded",
            "created_at": now,
            "updated_at": now
        }
        res = coll.insert_one(doc)
        doc["id"] = str(res.inserted_id)
        return doc

    @classmethod
    def get_by_id(cls, doc_id: Union[str, int]) -> Optional[Dict[str, Any]]:
        coll = cls.get_collection()
        try:
            oid = ObjectId(doc_id) if isinstance(doc_id, str) and len(doc_id) == 24 else doc_id
            doc = coll.find_one({"_id": oid})
        except Exception:
            doc = coll.find_one({"_id": str(doc_id)})
        return _serialize_mongo_doc(doc)

    @classmethod
    def get_user_documents(cls, user_id: str) -> List[Dict[str, Any]]:
        coll = cls.get_collection()
        cursor = coll.find({"user_id": str(user_id)}).sort("created_at", -1)
        return [_serialize_mongo_doc(d) for d in cursor]

    @classmethod
    def update_feedback(cls, doc_id: Union[str, int], feedback_json: str, status: str = "analyzed") -> Optional[Dict[str, Any]]:
        coll = cls.get_collection()
        try:
            oid = ObjectId(doc_id) if isinstance(doc_id, str) and len(doc_id) == 24 else doc_id
            coll.update_one(
                {"_id": oid},
                {"$set": {"feedback_json": feedback_json, "status": status, "updated_at": datetime.now(timezone.utc)}}
            )
            return cls.get_by_id(doc_id)
        except Exception:
            return None

    @classmethod
    def delete_document(cls, doc_id: Union[str, int], user_id: str) -> bool:
        coll = cls.get_collection()
        try:
            oid = ObjectId(doc_id) if isinstance(doc_id, str) and len(doc_id) == 24 else doc_id
            res = coll.delete_one({"_id": oid, "user_id": str(user_id)})
            return res.deleted_count > 0
        except Exception:
            return False
