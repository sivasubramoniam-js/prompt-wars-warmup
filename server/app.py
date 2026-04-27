from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.utils import secure_filename
from services.gemini_service import analyze_emergency, enrich_signals, search_global_disasters
import os
import logging
import feedparser
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Security: Enable CORS safely
CORS(app, resources={r"/api/*": {"origins": "*"}}) # In production, restrict this to specific domains

# Security: Add Secure Headers with Talisman
csp = {
    'default-src': [
        '\'self\'',
        '*.google.com',
        '*.googleapis.com',
        '*.google-analytics.com',
        '*.gstatic.com',
        'data:',
        'blob:'
    ],
    'script-src': ['\'self\'', '\'unsafe-inline\'', '*.google.com', '*.googleapis.com'],
    'style-src': ['\'self\'', '\'unsafe-inline\'', '*.googleapis.com', 'fonts.googleapis.com'],
    'img-src': ['\'self\'', 'data:', 'blob:', '*.google.com', '*.googleapis.com', '*.gstatic.com', 'wttr.in']
}
Talisman(app, content_security_policy=None, force_https=False) # force_https=False for local development to avoid ERR_SSL_PROTOCOL_ERROR

# Security: Rate Limiting
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

logging.basicConfig(level=logging.INFO)

@app.route('/api/upload', methods=['POST'])
@limiter.limit("10 per minute")
def upload_files():
    image_path = None
    audio_path = None
    try:
        text_input = request.form.get('text', '').strip()
        
        # Validation
        if not text_input and 'image' not in request.files and 'audio' not in request.files:
            return jsonify({"error": "Minimum context required (text, image, or audio)."}), 400
            
        image_file = request.files.get('image')
        audio_file = request.files.get('audio')
        
        # Save temp files securely
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
        return jsonify({"error": "Failed to analyze emergency. See backend logs."}), 500
        
    finally:
        # Security Cleanup
        if image_path and os.path.exists(image_path):
            try: os.remove(image_path)
            except: pass
                
        if audio_path and os.path.exists(audio_path):
            try: os.remove(audio_path)
            except: pass

@app.route('/api/news', methods=['GET'])
def get_news():
    feeds = {"GDACS": "https://www.gdacs.org/xml/rss.xml"}
    news_items = []
    for source, url in feeds.items():
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:5]:
                news_items.append({
                    "title": entry.title,
                    "summary": entry.description,
                    "link": entry.link,
                    "source": source,
                    "date": entry.published[:16] if hasattr(entry, 'published') else 'N/A'
                })
        except Exception as e:
            app.logger.error(f"Error fetching news: {e}")
    return jsonify(news_items)

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    try:
        # In a real app, this would query a DB or government API
        alerts = [
            {"id": 1, "title": "Severe Heatwave Alert", "region": "Northern Karnataka", "severity": "Orange", "source": "IMD", "details": "Expect temperatures above 42°C."},
            {"id": 2, "title": "Flood Warning", "region": "Assam Valley", "severity": "Red", "source": "NDMA", "details": "Rivers flowing above danger levels."}
        ]
        return jsonify(alerts)
    except Exception:
        return jsonify([])

from services.telegram_service import send_telegram_alert, format_signal_for_telegram

@app.route('/api/telegram/alert', methods=['POST'])
@limiter.limit("5 per minute")
def telegram_alert():
    data = request.json
    signal = data.get('signal')
    chat_id = data.get('chat_id')
    if not signal or not chat_id:
        return jsonify({"error": "Missing critical dispatch details."}), 400
        
    message = format_signal_for_telegram(signal)
    success = send_telegram_alert(chat_id, message)
    return jsonify({"success": success})

@app.route('/api/signals', methods=['GET'])
def get_signals():
    """AI Search-driven discovery engine."""
    try:
        range_days = request.args.get('range', '1')
        # Use the powerful AI Search Discovery Engine we built
        signals = search_global_disasters(range_days)
        return jsonify({"signals": signals})
    except Exception as e:
        app.logger.error(f"Search Discovery Failed: {e}")
        return jsonify({"signals": []})

@app.route('/api/weather', methods=['GET'])
@limiter.limit("30 per minute")
def get_weather():
    city = secure_filename(request.args.get('city', 'Bangalore')) # Basic sanitization
    try:
        resp = requests.get(f"https://wttr.in/{city}?format=j1", timeout=10)
        data = resp.json()
        current = data['current_condition'][0]
        return jsonify({
            "city": city, "temp": current['temp_C'], "desc": current['weatherDesc'][0]['value'],
            "humidity": current['humidity'], "wind": current['windspeedKmph'], "precip": current['precipMM']
        })
    except Exception:
        return jsonify({"error": "Weather data unavailable"}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=False) # Turned off debug for cleaner prod deployment
