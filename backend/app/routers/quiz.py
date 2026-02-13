from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from ..database import get_db
from ..models import Quiz, Question, Option
from ..schemas import QuizRequest, QuizResponse, QuestionBase, OptionBase
from ..services.scraper import scrape_wikipedia
from ..services.llm import generate_quiz_from_text
from ..services.pdf_service import extract_text_from_pdf

router = APIRouter()

@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    topic: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        source_content = ""
        title = ""
        source_url = url or "file_upload"
        
        # 1. Determine Source & Extract Content
        if url:
            print(f"Received generation request for URL: {url}")
            # Check cache for URL
            existing_quiz_result = await db.execute(
                select(Quiz)
                .options(selectinload(Quiz.questions).selectinload(Question.options))
                .where(Quiz.url == url)
            )
            existing_quiz = existing_quiz_result.scalars().first()
            if existing_quiz:
                print("Quiz found in cache. Returning existing quiz.")
                return map_quiz_to_response(existing_quiz)

            print("Scraping Wikipedia...")
            scraped_data = scrape_wikipedia(url)
            source_content = scraped_data['content']
            title = scraped_data['title']
            print("Scraping complete.")
            
        elif file:
            print(f"Received generation request for PDF: {file.filename}")
            content = await file.read()
            source_content = extract_text_from_pdf(content)
            title = file.filename
            print("PDF extraction complete.")
            
        elif topic:
             print(f"Received generation request for Topic: {topic}")
             source_content = f"Generate a quiz about: {topic}"
             title = f"Quiz: {topic}"
        else:
             raise HTTPException(status_code=400, detail="Please provide a URL, a PDF file, or a Topic.")

        # 2. Generate Quiz using LLM
        print("Generating quiz with LLM...")
        generated_data = generate_quiz_from_text(source_content)
        
        # 3. Save to Database
        quiz = Quiz(
            url=source_url,
            title=generated_data.get('summary', title)[:100], # Use summary as title if available, else filename
            summary=generated_data.get('summary', ''),
            raw_content=source_content[:20000], # Store a chunk of raw content
            key_entities=generated_data.get('key_entities', {}),
            sections=generated_data.get('related_topics', []), # Map related topics to sections for now
            related_topics=generated_data.get('related_topics', [])
        )
        db.add(quiz)
        await db.commit()
        await db.refresh(quiz)
        
        for q_data in generated_data.get('quiz', []):
            question = Question(
                quiz_id=quiz.id,
                text=q_data['question'],
                difficulty=q_data.get('difficulty', 'medium'),
                explanation=q_data.get('explanation', '')
            )
            db.add(question)
            await db.commit()
            await db.refresh(question)
            
            for opt_text in q_data['options']:
                is_correct = (opt_text == q_data['answer'])
                option = Option(
                    question_id=question.id,
                    text=opt_text,
                    is_correct=1 if is_correct else 0
                )
                db.add(option)
        
        await db.commit()
        
        # Re-fetch with relationships
        result = await db.execute(
            select(Quiz)
            .options(selectinload(Quiz.questions).selectinload(Question.options))
            .where(Quiz.id == quiz.id)
        )
        quiz_loaded = result.scalars().first()
        
        return map_quiz_to_response(quiz_loaded)

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

def map_quiz_to_response(quiz_obj):
    questions_data = []
    for q in quiz_obj.questions:
        options_list = [opt.text for opt in q.options]
        # Find answer (where is_correct is 1/True)
        answer = next((opt.text for opt in q.options if opt.is_correct), "")
        
        questions_data.append({
            "question": q.text,
            "options": options_list,
            "answer": answer,
            "difficulty": q.difficulty,
            "explanation": q.explanation
        })
        
    return {
        "id": quiz_obj.id,
        "url": quiz_obj.url,
        "title": quiz_obj.title,
        "summary": quiz_obj.summary,
        "key_entities": quiz_obj.key_entities,
        "sections": quiz_obj.sections,
        "quiz": questions_data,
        "related_topics": quiz_obj.related_topics
    }

@router.get("/quizzes", response_model=List[QuizResponse])
async def get_quizzes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Quiz).options(selectinload(Quiz.questions).selectinload(Question.options)))
    quizzes = result.scalars().all()
    return [map_quiz_to_response(q) for q in quizzes]

@router.get("/quizzes/{quiz_id}", response_model=QuizResponse)
async def get_quiz(quiz_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Quiz).options(selectinload(Quiz.questions).selectinload(Question.options)).where(Quiz.id == quiz_id)
    )
    quiz = result.scalars().first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return map_quiz_to_response(quiz)
