from flask import Flask, request, jsonify
from flask_cors import CORS
from services.gemini_service import analyze_emergency
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Enable CORS for the local Vite dev server
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/upload', methods=['POST'])
def upload_files():
    try:
        text_input = request.form.get('text', '')
        
        image_file = request.files.get('image')
        audio_file = request.files.get('audio')
        
        image_path = None
        audio_path = None
        
        # Save temp files so the genai sdk can upload them
        if image_file and image_file.filename != '':
            os.makedirs('tmp', exist_ok=True)
            image_path = f"tmp/{image_file.filename}"
            image_file.save(image_path)
            
        if audio_file and audio_file.filename != '':
            os.makedirs('tmp', exist_ok=True)
            audio_path = f"tmp/{audio_file.filename}"
            audio_file.save(audio_path)
            
        result = analyze_emergency(text_input, image_path, audio_path)
        
        # Cleanup temp local files
        if image_path and os.path.exists(image_path):
            os.remove(image_path)
        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)
            
        return jsonify(result)
        
    except Exception as e:
        print("Error processing upload:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
