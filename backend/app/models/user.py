from datetime import datetime


def user_document(
    name: str,
    email: str,
    password_hash: str,
    role: str,
    student_id: str | None = None,
    department: str | None = None,
    year: int | None = None,
):
    return {
        "name": name,
        "email": email.lower(),
        "password_hash": password_hash,
        "role": role,
        "student_id": student_id,
        "department": department,
        "year": year,
        "created_at": datetime.utcnow(),
    }