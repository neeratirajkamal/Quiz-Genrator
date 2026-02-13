import os
import json
import time
import re
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from google.api_core.exceptions import ResourceExhausted

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

QUIZ_PROMPT = """
You are an expert quiz generator. Based on the following text, generate a quiz with 5 key questions that test understanding of the material.
The output MUST be a valid JSON object. Do not include markdown formatting (like ```json ... ```) in the response.

Structure:
{{
  "summary": "A concise summary of the text (max 3 sentences).",
  "key_entities": {{
    "people": ["List of key people..."],
    "organizations": ["List of key organizations..."],
    "locations": ["List of key locations..."]
  }},
  "quiz": [
    {{
      "question": "The question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "The correct answer (must be one of the options)",
      "difficulty": "Medium",
      "explanation": "Short explanation of why the answer is correct."
    }}
  ],
  "related_topics": ["Topic 1", "Topic 2", "Topic 3"]
}}

Text:
{text}
"""

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(ResourceExhausted)
)
def generate_content_with_retry(chain, truncated_text):
    return chain.invoke({"text": truncated_text})

def generate_quiz_from_text(text: str):
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY not found in environment variables.")

    # Use gemini-2.0-flash as it's the current active model
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=GOOGLE_API_KEY, temperature=0.7)
    
    # Gemini Flash has a large context window, but let's be safe and eco-friendly.
    # 30,000 chars is roughly 7-8k tokens, well within limits.
    truncated_text = text[:30000] 
    
    prompt = PromptTemplate(template=QUIZ_PROMPT, input_variables=["text"])
    chain = prompt | llm
    
    try:
        response = generate_content_with_retry(chain, truncated_text)
    except Exception as e:
        print(f"Generation failed: {e}. Retrying with smaller context...")
        truncated_text = text[:10000]
        response = chain.invoke({"text": truncated_text})
    
    # Clean up the response
    content = response.content.strip()
    # Remove markdown code blocks if present
    content = re.sub(r'^```json\s*', '', content)
    content = re.sub(r'^```\s*', '', content)
    content = re.sub(r'\s*```$', '', content)
    
    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        print(f"Content was: {content}")
        raise Exception("Failed to parse LLM response as JSON")
