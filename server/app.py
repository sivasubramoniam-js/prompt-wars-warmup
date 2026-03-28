from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from services.gemini_service import analyze_emergency, enrich_signals
import os
import logging
import feedparser
import requests
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

@app.route('/api/news', methods=['GET'])
def get_news():
    feeds = {
        "GDACS": "https://www.gdacs.org/xml/rss.xml",
    }
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
                    "date": entry.published if hasattr(entry, 'published') else 'N/A'
                })
        except Exception as e:
            app.logger.error(f"Error fetching {source}: {e}")
    return jsonify(news_items)

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    try:
        alerts = [
            {
                "id": 1,
                "title": "Severe Heatwave Alert",
                "region": "Northern Karnataka",
                "severity": "Orange",
                "source": "IMD",
                "details": "Expect temperatures above 42°C for the next 48 hours."
            },
            {
                "id": 2,
                "title": "Flood Warning",
                "region": "Assam Valley",
                "severity": "Red",
                "source": "NDMA",
                "details": "Major rivers flowing above danger levels. Evacuation in progress."
            }
        ]
        return jsonify(alerts)
    except Exception as e:
        return jsonify([])

from services.telegram_service import send_telegram_alert, format_signal_for_telegram

@app.route('/api/telegram/alert', methods=['POST'])
def telegram_alert():
    data = request.json
    signal = data.get('signal')
    chat_id = data.get('chat_id')
    if not signal or not chat_id:
        return jsonify({"error": "Missing signal or chat_id"}), 400
    message = format_signal_for_telegram(signal)
    success = send_telegram_alert(chat_id, message)
    if success:
        return jsonify({"success": True})
    return jsonify({"error": "Failed to send Telegram alert"}), 500

@app.route('/api/signals', methods=['GET'])
def get_signals():
    """Restored feed-based discovery with Gemini enrichment."""
    range_days = request.args.get('range', '1')
    signals = []
    
    usgs_feeds = {
        "1": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.atom",
        "7": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.atom",
        "30": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.atom"
    }
    usgs_url = usgs_feeds.get(range_days, usgs_feeds["1"])

    try:
        feed = feedparser.parse(usgs_url)
        limit = 8 if range_days == "1" else 15
        for entry in feed.entries[:limit]:
            point = entry.get('georss_point', '0 0').split()
            title = entry.title
            signals.append({
                "id": entry.id,
                "type": "EARTHQUAKE",
                "title": title,
                "lat": float(point[0]),
                "lng": float(point[1]),
                "severity": "Red" if any(v in title for v in ["M 6.", "M 7.", "M 8."]) else "Orange" if "M 5." in title or "M 4." in title else "Green",
                "date": entry.updated
            })
    except Exception as e:
        app.logger.error(f"USGS Fetch Error: {e}")

    try:
        gdacs_url = "https://www.gdacs.org/xml/rss.xml"
        feed = feedparser.parse(gdacs_url)
        for entry in feed.entries[:5]:
            if hasattr(entry, 'geo_lat'):
                signals.append({
                    "id": entry.link,
                    "type": "NATURAL",
                    "title": entry.title,
                    "lat": float(entry.geo_lat),
                    "lng": float(entry.geo_long),
                    "severity": "Red" if "Red" in entry.title else "Orange",
                    "date": entry.published if hasattr(entry, 'published') else "N/A"
                })
    except Exception as e:
        app.logger.error(f"GDACS Fetch Error: {e}")

    enriched_signals = enrich_signals(signals)
    return jsonify({"signals": enriched_signals})

@app.route('/api/weather', methods=['GET'])
def get_weather():
    city = request.args.get('city', 'Bangalore')
    try:
        resp = requests.get(f"https://wttr.in/{city}?format=j1", timeout=10)
        data = resp.json()
        current = data['current_condition'][0]
        return jsonify({
            "city": city,
            "temp": current['temp_C'],
            "desc": current['weatherDesc'][0]['value'],
            "humidity": current['humidity'],
            "wind": current['windspeedKmph'],
            "precip": current['precipMM']
        })
    except Exception as e:
        app.logger.error(f"Weather Fetch Error: {e}")
        return jsonify({"error": "Weather data unavailable"}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
