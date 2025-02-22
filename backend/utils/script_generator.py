import google.generativeai as genai
import os

# Set up Google Gemini API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_script(topic, duration, speakers):
    try:
        model = genai.GenerativeModel("gemini-pro")
        prompt = f"Generate a {duration}-minute podcast script on {topic} with {speakers} speakers."

        response = model.generate_content(prompt)

        if response and response.text:
            return response.text
        else:
            return "Failed to generate script."
    except Exception as e:
        return f"Error generating script: {str(e)}"
