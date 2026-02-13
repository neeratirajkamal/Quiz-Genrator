from pydantic import BaseModel
from typing import List, Optional, Dict

class OptionBase(BaseModel):
    text: str
    is_correct: bool

class QuestionBase(BaseModel):
    question: str
    options: List[str]
    answer: str
    difficulty: str
    explanation: str

class QuizRequest(BaseModel):
    url: str

class QuizResponse(BaseModel):
    id: int
    url: str
    title: str
    summary: str
    key_entities: Dict
    sections: List[str]
    quiz: List[QuestionBase]
    related_topics: List[str]

    class Config:
        from_attributes = True
