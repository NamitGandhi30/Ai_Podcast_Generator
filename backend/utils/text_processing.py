import PyPDF2
import json
import google.generativeai as genai

# Configure Google Gemini AI
genai.configure(api_key="AIzaSyB9hLd4QhKScSz5ITXgb3UHrO7LBeFog2Q")
gemini_model = genai.GenerativeModel('gemini-pro')

def extract_text_from_pdf(file_path):
    with open(file_path, "rb") as pdf_file:
        reader = PyPDF2.PdfReader(pdf_file)
        text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
    return text

def generate_script(topic, duration, speakers):
    prompt = f"""
    Create a {duration}-minute podcast script about {topic}.
    Include {speakers} hosts and make it conversational.
    Add an introduction, main discussion, and conclusion.
    """
    response = gemini_model.generate_content(prompt)
    return response.text if response else "Error generating script."
