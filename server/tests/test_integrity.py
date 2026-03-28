import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    # Ensure limiter is disabled for unit tests or handle it
    with app.test_client() as client:
        yield client

def test_signals_endpoint_structure(client):
    """Verify that signals endpoint returns correctly structured regional data."""
    response = client.get('/api/signals?range=1')
    assert response.status_code == 200
    data = response.get_json()
    assert 'signals' in data
    assert isinstance(data['signals'], list)

def test_weather_endpoint_validation(client):
    """Test weather endpoint with default and custom cities."""
    # Test Bangalore (default)
    response = client.get('/api/weather?city=Bangalore')
    assert response.status_code == 200
    data = response.get_json()
    assert data['city'] == 'Bangalore'
    
    # Test sanitization/safety
    response = client.get('/api/weather?city=../../etc/passwd')
    # secure_filename should sanitize this
    data = response.get_json()
    assert 'error' not in data # It should return weather for the sanitized name or fail gracefully

def test_telegram_alert_bad_request(client):
    """Verify that missing details in telegram alert return 400."""
    response = client.post('/api/telegram/alert', json={})
    assert response.status_code == 400
    assert "error" in response.get_json()

def test_news_and_alerts_integrity(client):
    """Ensure news and alerts endpoints are present and returning arrays."""
    resp_news = client.get('/api/news')
    assert resp_news.status_code == 200
    assert isinstance(resp_news.get_json(), list)
    
    resp_alerts = client.get('/api/alerts')
    assert resp_alerts.status_code == 200
    assert isinstance(resp_alerts.get_json(), list)

from unittest.mock import patch

def test_emergency_upload_quality(client):
    """Mock test for the upload endpoint's schema adherence."""
    with patch('app.analyze_emergency') as mock_ana:
        mock_ana.return_value = {
            "is_emergency": True,
            "status": "emergency",
            "immediate_actions": ["Evacuate"],
            "instruction": "Go to higher ground.",
            "contact_instructions": "911"
        }
        response = client.post('/api/upload', data={'text': 'Flood detected'})
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'emergency'
        assert 'instruction' in data
