import pdfplumber

def extract_text_from_pdf(pdf_path):
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])
        return text
    except Exception as e:
        return f"Error extracting text: {str(e)}"
