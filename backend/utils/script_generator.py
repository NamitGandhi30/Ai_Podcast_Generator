import google.generativeai as genai
import os
import re

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel("gemini-pro")

def clean_script(script_text):
    """Clean the script text by removing placeholders and keeping only the actual dialogue."""
    # Remove [placeholders]
    script_text = re.sub(r'\[.*?\]', '', script_text)
    
    # Remove **Title:** or similar markdown headers
    script_text = re.sub(r'\*\*.*?\*\*', '', script_text)
    
    # Remove lines that are just labels
    script_text = re.sub(r'^[A-Za-z]+:\s*$', '', script_text, flags=re.MULTILINE)
    
    # Extract only the actual dialogue lines
    dialogue_pattern = r'^([A-Za-z]+):\s*(.+)$'
    dialogue_matches = re.finditer(dialogue_pattern, script_text, re.MULTILINE)
    
    cleaned_lines = []
    for match in dialogue_matches:
        speaker = match.group(1)
        dialogue = match.group(2).strip()
        if dialogue and not dialogue.endswith(':'):
            cleaned_lines.append(f"{speaker}: {dialogue}")
    
    # Join with proper spacing
    cleaned_script = '\n\n'.join(cleaned_lines)
    
    # Remove extra whitespace
    cleaned_script = re.sub(r'\n{3,}', '\n\n', cleaned_script)
    return cleaned_script.strip()

def generate_script(topic, duration, speakers):
    """Generate a podcast script using Gemini."""
    host_names = ["Alex", "Sarah", "Mike", "Emma", "David"]
    speakers = int(speakers)
    selected_hosts = host_names[:speakers]
    host_names_str = ", ".join(selected_hosts)
    
    prompt = f"""
    Create a {duration}-minute podcast script about {topic}. 
    Use these host names: {host_names_str}
    
    Requirements:
    1. Start with hosts naturally introducing themselves using their actual names
    2. Have a structured conversation with:
       - Introduction to the topic
       - Main discussion points
       - Concluding thoughts
    3. Keep the dialogue natural and conversational
    4. End with a brief outro
    
    Format example:
    Alex: Hi everyone, I'm Alex!
    Sarah: And I'm Sarah! Today we're diving into...
    """
    
    try:
        response = gemini_model.generate_content(prompt)
        if response:
            return clean_script(response.text)
        return "Error generating script."
    except Exception as e:
        return f"Error generating script: {str(e)}"