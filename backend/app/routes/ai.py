from typing import List, Dict, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.utils.jwt import get_current_user
from app.ai.service import process_chat, get_proactive_insights

router = APIRouter(
    prefix="/ai",
    tags=["Agentic AI Assistant"]
)


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Student query or prompt")
    history: Optional[List[Dict[str, str]]] = Field(
        default=None, description="Previous conversation turns"
    )


class ChatMessageResponse(BaseModel):
    response: str
    tools_used: List[str]
    suggestions: List[str]


@router.post("/chat", response_model=ChatMessageResponse)
def chat_with_agent(
    payload: ChatMessageRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Interact with the Smart Campus Agentic AI Assistant.
    Identifies the authenticated student from JWT and executes secure backend tools.
    """
    try:
        result = process_chat(
            message=payload.message,
            current_user=current_user,
            history=payload.history
        )
        return result
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI processing error: {str(error)}"
        )


@router.get("/proactive")
def get_proactive_alerts(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieve real-time proactive warnings, deadlines, and insights
    analyzed from MongoDB for the current student.
    """
    try:
        insights = get_proactive_insights(current_user)
        return {
            "count": len(insights),
            "insights": insights
        }
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate proactive insights: {str(error)}"
        )
