import os
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
import json
import logging
import uuid
from datetime import datetime

class EmergencyResponse(BaseModel):
    urgency_level: str = Field(description="Must be 'Red', 'Yellow', or 'Green'")
    immediate_actions: list[str] = Field(description="Ranked list of top 3-5 safety steps")
    evacuation_plan: str = Field(description="Nearest shelter type and route guidance description based on context")
    shareable_safety_card: str = Field(description="A short, concise summary for family WhatsApp groups")

class EnrichedSignal(BaseModel):
    id: str
    type: str
    title: str
    lat: float
    lng: float
    severity: str
    date: str
    impact_summary: str = Field(description="A 2-sentence summary of the disaster's localized impact based on feed or web data")
    threat_level: str = Field(description="Low, Moderate, High, or Extreme")
    safety_guideline: str = Field(description="One immediate survival instruction for residents in this coordinate")
    web_intelligence: str = Field(description="Verified news snippet from Google Search results for this disaster")

class EnrichedSignalsResponse(BaseModel):
    signals: list[EnrichedSignal]

def analyze_emergency(text: str, image_path: str = None, audio_path: str = None) -> dict:
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    
    system_instruction = (
        "You are a Senior Disaster Response Specialist. Analyze multimodal inputs and provide safety guidelines."
    )
    
    contents = []
    if text: contents.append(text)
    files_to_delete = []
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
            model='gemini-3.1-flash-lite-preview',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )
        result = json.loads(response.text)
    finally:
        for f in files_to_delete:
            client.files.delete(name=f.name)
    return result

def enrich_signals(raw_signals: list) -> list:
    """Uses Gemini 3.1 with Web Search to add situational intelligence to raw disaster signals from feeds."""
    if not raw_signals:
        return []

    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    
    prompt = f"Analyze these raw global disaster signals and use Google Search to find current news, verified impact data, and local safety updates for each: {json.dumps(raw_signals)}. Then enrich them according to the scheme."
    
    system_instruction = (
        "You are a Global Situational Intelligence Agent with Search capability. "
        "For each provided disaster signal, use Google Search to find the latest localized news, "
        "confirmed damages, or official evacuation notices. Summarize this in the 'impact_summary' "
        "and 'web_intelligence' fields. Ensure IDs and coordinates are exactly preserved."
    )

    try:
        google_search_tool = types.Tool(google_search=types.GoogleSearch())

        response = client.models.generate_content(
            model='gemini-3.1-flash-lite-preview',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                tools=[google_search_tool],
                response_mime_type="application/json",
                response_schema=EnrichedSignalsResponse,
                temperature=0.3,
            ),
        )
        
        data = json.loads(response.text)
        return data.get('signals', [])
    except Exception as e:
        logging.error(f"Signal Enrichment Failed: {e}")
        # Return raw signals if enrichment fails, ensuring the list matches the expected schema partially
        return raw_signals

def search_global_disasters(range_days: str) -> list:
    """Kept as an alternative, but enrich_signals is now the primary discover path as per UNDO request."""
    return enrich_signals([])
