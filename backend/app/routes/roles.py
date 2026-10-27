from fastapi import APIRouter, Depends
from app.utils.jwt import get_current_user
from app.utils.roles import require_role

router = APIRouter(
    prefix="/roles",
    tags=["Roles"]
)


@router.get("/student")
def student_only(current_user=Depends(get_current_user)):

    require_role(current_user, ["student"])

    return {
        "message": "Student access granted",
        "role": current_user["role"]
    }


@router.get("/faculty")
def faculty_only(current_user=Depends(get_current_user)):

    require_role(current_user, ["faculty"])

    return {
        "message": "Faculty access granted",
        "role": current_user["role"]
    }


@router.get("/admin")
def admin_only(current_user=Depends(get_current_user)):

    require_role(current_user, ["admin"])

    return {
        "message": "Admin access granted",
        "role": current_user["role"]
    }