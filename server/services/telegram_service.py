import os
import requests
import logging

def send_telegram_alert(chat_id, message):
    """Sends an emergency alert message to a specific Telegram chat."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token or not chat_id:
        logging.warning("Telegram Bot Token or Chat ID missing.")
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "Markdown"
    }

    try:
        resp = requests.post(url, json=payload, timeout=10)
        resp.raise_for_status()
        return True
    except Exception as e:
        logging.error(f"Telegram Alert Failed: {e}")
        return False

def format_signal_for_telegram(signal):
    """Formats a disaster signal into a readable Telegram message."""
    icon = "🔴" if signal.get('severity') == 'Red' else "🟠"
    threat = signal.get('threat_level', 'High').upper()
    
    msg = (
        f"{icon} *SAHAY EMERGENCY ALERT*\n\n"
        f"*Type:* {signal['type']}\n"
        f"*Event:* {signal['title']}\n"
        f"*Threat Level:* {threat}\n\n"
        f"*AI Impact Analysis:* {signal.get('impact_summary', 'Monitor situation.')}\n\n"
        f"🛡️ *MISSION DIRECTIVE:* {signal.get('safety_guideline', 'Stay Alert.')}\n\n"
        f"🔗 [Verified Intelligence]({signal.get('web_intelligence', 'https://www.google.com')})"
    )
    return msg
