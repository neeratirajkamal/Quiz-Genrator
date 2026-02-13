from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import quiz
from .database import init_db

app = FastAPI(title="DeepKlarity AI Quiz Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

app.include_router(quiz.router, prefix="/api", tags=["quiz"])

@app.get("/")
def read_root():
    return {"message": "Welcome to DeepKlarity AI Quiz Generator API"}
