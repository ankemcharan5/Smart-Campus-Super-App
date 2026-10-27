from fastapi import HTTPException, status


def require_role(current_user, allowed_roles):

    if current_user["role"] not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource"
        )

    return current_user