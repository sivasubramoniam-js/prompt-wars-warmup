from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from services.gemini_service import analyze_emergency
import os
import logging
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Enable CORS for the local Vite dev server
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/upload', methods=['POST'])
def upload_files():
    image_path = None
    audio_path = None
    try:
        text_input = request.form.get('text', '')
        
        image_file = request.files.get('image')
        audio_file = request.files.get('audio')
        
        # Save temp files securely so the genai sdk can upload them
        if image_file and image_file.filename != '':
            os.makedirs('/tmp/uploads', exist_ok=True)
            filename = secure_filename(image_file.filename)
            image_path = os.path.join('/tmp/uploads', filename)
            image_file.save(image_path)
            
        if audio_file and audio_file.filename != '':
            os.makedirs('/tmp/uploads', exist_ok=True)
            filename = secure_filename(audio_file.filename)
            audio_path = os.path.join('/tmp/uploads', filename)
            audio_file.save(audio_path)
            
        result = analyze_emergency(text_input, image_path, audio_path)
        return jsonify(result)
        
    except Exception as e:
        app.logger.error(f"Error processing upload: {e}")
        return jsonify({"error": "Failed to analyze emergency efficiently. See backend logs."}), 500
        
    finally:
        # GUARANTEED EFFICIENCY & SECURITY CLEANUP
        # Always remove local temp files even if Gemini analysis exceptions occur
        if image_path and os.path.exists(image_path):
            try:
                os.remove(image_path)
            except OSError as e:
                app.logger.warning(f"Could not remove secure image upload: {e}")
                
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
            except OSError as e:
                app.logger.warning(f"Could not remove secure audio upload: {e}")

if __name__ == '__main__':
    app.run(port=5000, debug=True)
