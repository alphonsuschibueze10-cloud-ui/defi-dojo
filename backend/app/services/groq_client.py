import httpx
import json
from typing import Dict, Any, List
from app.core.config import settings


class GroqClient:
    def __init__(self):
        self.api_key = settings.groq_api_key
        self.base_url = "https://api.groq.com/openai/v1"
        self.model = "gpt-4o-mini"
    
    async def chat_completion(self, messages: List[Dict[str, str]], temperature: float = 0.2) -> Dict[str, Any]:
        """Send chat completion request to Groq API"""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": 500
        }
        
        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    json=payload,
                    headers=headers
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise Exception(f"Groq API error: {str(e)}")
    
    async def generate_hint(self, context: Dict[str, Any]) -> Dict[str, str]:
        """Generate AI hint for quest context"""
        
        # Build prompt from context
        prompt = self._build_hint_prompt(context)
        
        messages = [
            {
                "role": "system",
                "content": "You are Satoshi Sensei, an expert in Stacks DeFi. Provide concise, actionable hints for DeFi quests. Always respond in JSON format with 'hint', 'risk', and 'param' fields."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
        
        try:
            response = await self.chat_completion(messages, temperature=0.2)
            content = response["choices"][0]["message"]["content"]
            
            # Parse JSON response
            try:
                result = json.loads(content)
                return {
                    "hint": result.get("hint", "Consider your next move carefully."),
                    "risk": result.get("risk", "medium"),
                    "param": result.get("param", "slippage: 0.5%")
                }
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "hint": content[:100] + "..." if len(content) > 100 else content,
                    "risk": "medium",
                    "param": "slippage: 0.5%"
                }
                
        except Exception as e:
            # Fallback response
            return {
                "hint": "I'm having trouble connecting right now. Try analyzing the market conditions and your current position.",
                "risk": "medium",
                "param": "slippage: 0.5%"
            }
    
    def _build_hint_prompt(self, context: Dict[str, Any]) -> str:
        """Build prompt from quest context"""
        
        quest_info = context.get("quest", {})
        balances = context.get("balances", {})
        action_history = context.get("action_history", [])
        quest_step = context.get("quest_step", 1)
        
        prompt = f"""Given the following user quest context:

QUEST: {json.dumps(quest_info, indent=2)}
WALLET BALANCES: {json.dumps(balances, indent=2)}
ACTION HISTORY: {json.dumps(action_history, indent=2)}
CURRENT STEP: {quest_step}

Provide a concise hint (max 60 words) explaining the next optimal step, include one risk check and a single recommended parameter (e.g., slippage 0.5%). 

Output as JSON: {{ "hint": "...", "risk": "...", "param": "..." }}"""
        
        return prompt


# Global instance
groq_client = GroqClient()
