import pytest
import os
from unittest.mock import patch
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@patch('app.analyze_emergency')
def test_text_upload_success(mock_analyze, client):
    # Arrange
    mock_analyze.return_value = {
        "urgency_level": "Green",
        "immediate_actions": ["Stay calm, no immediate threat."],
        "evacuation_plan": "Shelter in place.",
        "shareable_safety_card": "Flood risk low. Stay home."
    }
    
    # Act
    payload = {'text': 'Some mock context about flooding'}
    response = client.post('/api/upload', data=payload)
    
    # Assert
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['urgency_level'] == 'Green'
    mock_analyze.assert_called_once_with('Some mock context about flooding', None, None)

def test_internal_server_error_handled_gracefully(client):
    """
    Test that an unexpected exception during processing correctly
    returns a 500 JSON response instead of crashing the server.
    """
    with patch('app.analyze_emergency') as mock_analyze:
        mock_analyze.side_effect = Exception("Simulated Gemini API Failure")
        response = client.post('/api/upload', data={'text': 'Help'})
        
        assert response.status_code == 500
        json_data = response.get_json()
        assert "error" in json_data
        assert "See backend logs" in json_data["error"]
