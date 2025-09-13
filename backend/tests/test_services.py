import pytest
from unittest.mock import patch, AsyncMock
from app.services.groq_client import GroqClient
import httpx


@pytest.fixture
def groq_client():
    """Create GroqClient instance"""
    return GroqClient()


def test_groq_client_initialization(groq_client):
    """Test GroqClient initialization"""
    assert groq_client.api_key is not None
    assert groq_client.base_url == "https://api.groq.com/openai/v1"
    assert groq_client.model == "gpt-4o-mini"


@patch('httpx.AsyncClient')
def test_chat_completion_success(mock_client, groq_client):
    """Test successful chat completion"""
    # Mock response
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "choices": [
            {
                "message": {
                    "content": "Test response"
                }
            }
        ]
    }
    mock_response.raise_for_status.return_value = None
    
    # Mock client
    mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
    
    # Test
    import asyncio
    messages = [{"role": "user", "content": "Hello"}]
    result = asyncio.run(groq_client.chat_completion(messages))
    
    assert result == {
        "choices": [
            {
                "message": {
                    "content": "Test response"
                }
            }
        ]
    }


@patch('httpx.AsyncClient')
def test_chat_completion_http_error(mock_client, groq_client):
    """Test chat completion with HTTP error"""
    # Mock response with error
    mock_response = AsyncMock()
    mock_response.raise_for_status.side_effect = httpx.HTTPError("API Error")
    
    # Mock client
    mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
    
    # Test
    import asyncio
    messages = [{"role": "user", "content": "Hello"}]
    
    with pytest.raises(Exception) as exc_info:
        asyncio.run(groq_client.chat_completion(messages))
    
    assert "Groq API error" in str(exc_info.value)


@patch('httpx.AsyncClient')
def test_generate_hint_success(mock_client, groq_client):
    """Test successful hint generation"""
    # Mock response
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "choices": [
            {
                "message": {
                    "content": '{"hint": "Test hint", "risk": "low", "param": "slippage: 0.5%"}'
                }
            }
        ]
    }
    mock_response.raise_for_status.return_value = None
    
    # Mock client
    mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
    
    # Test
    import asyncio
    context = {
        "quest": {"name": "Test Quest"},
        "balances": {"STX": 100},
        "action_history": [],
        "quest_step": 1
    }
    result = asyncio.run(groq_client.generate_hint(context))
    
    assert result["hint"] == "Test hint"
    assert result["risk"] == "low"
    assert result["param"] == "slippage: 0.5%"


@patch('httpx.AsyncClient')
def test_generate_hint_invalid_json(mock_client, groq_client):
    """Test hint generation with invalid JSON response"""
    # Mock response with invalid JSON
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "choices": [
            {
                "message": {
                    "content": "Invalid JSON response"
                }
            }
        ]
    }
    mock_response.raise_for_status.return_value = None
    
    # Mock client
    mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
    
    # Test
    import asyncio
    context = {"quest": {}, "balances": {}, "action_history": [], "quest_step": 1}
    result = asyncio.run(groq_client.generate_hint(context))
    
    # Should return fallback response
    assert "hint" in result
    assert "risk" in result
    assert "param" in result


@patch('httpx.AsyncClient')
def test_generate_hint_api_error(mock_client, groq_client):
    """Test hint generation with API error"""
    # Mock client to raise exception
    mock_client.return_value.__aenter__.return_value.post.side_effect = httpx.HTTPError("API Error")
    
    # Test
    import asyncio
    context = {"quest": {}, "balances": {}, "action_history": [], "quest_step": 1}
    result = asyncio.run(groq_client.generate_hint(context))
    
    # Should return fallback response
    assert "hint" in result
    assert "trouble connecting" in result["hint"]
    assert result["risk"] == "medium"
    assert result["param"] == "slippage: 0.5%"


def test_build_hint_prompt(groq_client):
    """Test hint prompt building"""
    context = {
        "quest": {"name": "Test Quest", "description": "A test quest"},
        "balances": {"STX": 100, "sBTC": 0.5},
        "action_history": [{"action": "swap", "amount": 10}],
        "quest_step": 2
    }
    
    prompt = groq_client._build_hint_prompt(context)
    
    assert "Test Quest" in prompt
    assert "STX" in prompt
    assert "sBTC" in prompt
    assert "swap" in prompt
    assert "2" in prompt
    assert "JSON" in prompt


def test_build_hint_prompt_minimal_context(groq_client):
    """Test hint prompt building with minimal context"""
    context = {
        "quest": {},
        "balances": {},
        "action_history": [],
        "quest_step": 1
    }
    
    prompt = groq_client._build_hint_prompt(context)
    
    assert "quest" in prompt.lower()
    assert "balances" in prompt.lower()
    assert "action_history" in prompt.lower()
    assert "1" in prompt


def test_chat_completion_with_temperature(groq_client):
    """Test chat completion with custom temperature"""
    with patch('httpx.AsyncClient') as mock_client:
        mock_response = AsyncMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"choices": [{"message": {"content": "Test"}}]}
        mock_response.raise_for_status.return_value = None
        
        mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
        
        import asyncio
        messages = [{"role": "user", "content": "Hello"}]
        result = asyncio.run(groq_client.chat_completion(messages, temperature=0.5))
        
        # Verify the request was made with correct temperature
        mock_client.return_value.__aenter__.return_value.post.assert_called_once()
        call_args = mock_client.return_value.__aenter__.return_value.post.call_args
        assert call_args[1]["json"]["temperature"] == 0.5


def test_chat_completion_default_temperature(groq_client):
    """Test chat completion with default temperature"""
    with patch('httpx.AsyncClient') as mock_client:
        mock_response = AsyncMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"choices": [{"message": {"content": "Test"}}]}
        mock_response.raise_for_status.return_value = None
        
        mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
        
        import asyncio
        messages = [{"role": "user", "content": "Hello"}]
        result = asyncio.run(groq_client.chat_completion(messages))
        
        # Verify the request was made with default temperature
        mock_client.return_value.__aenter__.return_value.post.assert_called_once()
        call_args = mock_client.return_value.__aenter__.return_value.post.call_args
        assert call_args[1]["json"]["temperature"] == 0.2


def test_generate_hint_with_complex_context(groq_client):
    """Test hint generation with complex context"""
    with patch('httpx.AsyncClient') as mock_client:
        mock_response = AsyncMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "choices": [
                {
                    "message": {
                        "content": '{"hint": "Complex hint with multiple parameters", "risk": "high", "param": "slippage: 1.0%"}'
                    }
                }
            ]
        }
        mock_response.raise_for_status.return_value = None
        
        mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
        
        import asyncio
        context = {
            "quest": {
                "name": "Complex Quest",
                "description": "A complex DeFi quest",
                "rules": {"min_amount": 100, "max_slippage": 0.01}
            },
            "balances": {
                "STX": 1000,
                "sBTC": 0.1,
                "USDA": 500
            },
            "action_history": [
                {"action": "swap", "from": "STX", "to": "sBTC", "amount": 100},
                {"action": "add_liquidity", "pair": "STX/sBTC", "amount": 50}
            ],
            "quest_step": 3,
            "market_data": {
                "STX_price": 1.5,
                "sBTC_price": 45000
            }
        }
        
        result = asyncio.run(groq_client.generate_hint(context))
        
        assert result["hint"] == "Complex hint with multiple parameters"
        assert result["risk"] == "high"
        assert result["param"] == "slippage: 1.0%"
