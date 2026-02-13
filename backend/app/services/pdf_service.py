import io
from pypdf import PdfReader

def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extracts text from a PDF file content (bytes).
    """
    try:
        reader = PdfReader(io.BytesIO(file_content))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")
