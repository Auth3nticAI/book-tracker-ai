from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


class BookCreate(BaseModel):
    title: str
    author: str
    status: str = "want_to_read"
    rating: Optional[int] = None


class BookUpdate(BaseModel):
    status: Optional[str] = None
    rating: Optional[int] = None


class BookResponse(BaseModel):
    id: int
    title: str
    author: str
    status: str
    rating: Optional[int]

    model_config = {"from_attributes": True}


# ---------- Notes ----------


class NoteCreate(BaseModel):
    content: str
    page_number: Optional[int] = None


class NoteResponse(BaseModel):
    id: int
    book_id: int
    content: str
    page_number: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}


class NoteSummaryResponse(BaseModel):
    book_id: int
    book_title: str
    note_count: int
    summary: str


# ---------- AI ----------


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str
    updated_history: list[ChatMessage]


class AgentRequest(BaseModel):
    message: str


class AgentStep(BaseModel):
    iteration: int
    tool: str
    input: dict
    # 'result' is intentionally loose — different tools return different shapes.
    result: object


class AgentResponse(BaseModel):
    response: str
    agent_steps: list[AgentStep]
