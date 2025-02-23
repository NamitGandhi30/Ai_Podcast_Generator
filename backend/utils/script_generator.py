import google.generativeai as genai
import os
import re
from typing import Dict, List

class ScriptGenerator:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-pro")
        self.trend_topics = self._get_trending_topics()

    def _get_trending_topics(self):
        return ["AI Ethics", "Climate Tech", "Web3 Innovations", "Quantum Computing"]

    def generate_script(self, user_input: Dict):
        try:
            print("✅ Received Input:", user_input)
            prompt = self._build_prompt(user_input)
            print("📜 Generated Prompt:", prompt)

            response = self.model.generate_content(prompt)
            print("🔄 Raw Response Object:", response)

            # Ensure response contains valid text
            if not response or not hasattr(response, "candidates") or not response.candidates:
                print("❌ Error: Gemini AI returned an empty response")
                return "Error: Gemini AI did not return valid text."

            # Extract text correctly using dot notation
            script_text = response.candidates[0].content.parts[0].text
            print("📝 Raw Script Text:", script_text)

            cleaned_script = self._clean_script(script_text, user_input["speakers"])
            print("✅ Cleaned Script:", cleaned_script)

            return cleaned_script

        except Exception as e:
            print("❌ Error Generating Script:", e)
            return "Error: Failed to generate script."

    def _build_prompt(self, user_input: Dict):
        """Generates a structured prompt for the AI model."""
        base_prompt = (
            f"Create a {user_input['duration']}-minute podcast script about {user_input['topic']}\n"
            f"Speakers: {', '.join(user_input['speakers'])}\n"
            f"Mood: {user_input['mood']}\n"
            f"Location: {user_input['location']}\n"
            f"Include: Introduction, key discussion points, and conclusion."
        )

        if user_input.get("trendy", False):
            base_prompt += f"\nIncorporate trending topics: {', '.join(self.trend_topics[:3])}"
        
        return base_prompt + "\nFormat:\n[Speaker]: [Dialogue]\n\n"

    def _clean_script(self, script: str, speakers: List[str]):
        """Cleans the AI-generated script to ensure structured dialogue."""
        cleaned_lines = []
        valid_speakers = {s.lower(): s.capitalize() for s in speakers}

        for line in script.split("\n"):
            if ":" in line:
                speaker, dialogue = map(str.strip, line.split(":", 1))
                if speaker.lower() in valid_speakers and len(dialogue) > 5:
                    cleaned_lines.append(f"{valid_speakers[speaker.lower()]}: {dialogue}")

        return "\n\n".join(cleaned_lines) if cleaned_lines else script
