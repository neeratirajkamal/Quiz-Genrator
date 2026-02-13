import requests
from bs4 import BeautifulSoup
import random
import time

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36"
]

def scrape_wikipedia(url: str):
    headers = {
        "User-Agent": random.choice(USER_AGENTS)
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        raise Exception(f"Failed to fetch page: {str(e)}")
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Try different title selectors
    title_tag = soup.find('h1', id='firstHeading') or soup.find('h1')
    title = title_tag.text.strip() if title_tag else "Untitled Article"
    
    # Get the main content
    content_div = soup.find('div', id='mw-content-text') or soup.find('article') or soup.find('body')
    
    if not content_div:
        raise Exception("Could not find article content.")
        
    paragraphs = content_div.find_all('p')
    
    # Extract text from paragraphs
    text_content = ""
    for p in paragraphs:
        if p.text.strip():
            text_content += p.text.strip() + "\n\n"
        
    # Basic section extraction
    sections = []
    headers = content_div.find_all(['h2', 'h3'])
    for header in headers:
        text = header.text.strip().replace('[edit]', '')
        if text:
            sections.append(text)
        
    return {
        "title": title,
        "content": text_content,
        "raw_content": str(content_div)[:20000], # Limit raw content storage
        "sections": sections
    }
