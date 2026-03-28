import os
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
import json

class EmergencyResponse(BaseModel):
    urgency_level: str = Field(description="Must be 'Red', 'Yellow', or 'Green'")
    immediate_actions: list[str] = Field(description="Ranked list of top 3-5 safety steps")
    evacuation_plan: str = Field(description="Nearest shelter type and route guidance description based on context")
    shareable_safety_card: str = Field(description="A short, concise summary for family WhatsApp groups")

def analyze_emergency(text: str, image_path: str = None, audio_path: str = None) -> dict:
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    
    system_instruction = (
        "You are a Senior Disaster Response Specialist. Your job is to analyze "
        "multimodal inputs from users in an emergency (monsoon/hurricane/flooding). "
        "Extract the location context from the inputs. "
        "Determine the water depth, structural hazards from the image (if any). "
        "Transcribe and interpret the urgency/emotional state from the audio (if any). "
        "Cross-reference this with a 'Mock Weather API' response. Assume local weather "
        "report says 'Severe flooding expected in next 2 hours. Seek high ground.' "
        "Always output exactly in the requested JSON structure."
    )
    
    contents = []
    
    if text:
        contents.append(text)
        
    files_to_delete = []
    
    # Upload local files to Gemini File API
    if image_path:
        genai_image = client.files.upload(file=image_path)
        contents.append(genai_image)
        files_to_delete.append(genai_image)
        
    if audio_path:
        genai_audio = client.files.upload(file=audio_path)
        contents.append(genai_audio)
        files_to_delete.append(genai_audio)

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=EmergencyResponse,
                temperature=0.2,
            ),
        )
        
        result = json.loads(response.text)
    finally:
        for f in files_to_delete:
            client.files.delete(name=f.name)
            
    return result
