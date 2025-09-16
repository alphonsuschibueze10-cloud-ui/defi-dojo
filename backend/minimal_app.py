#!/usr/bin/env python3
"""
Minimal Python web app for deployment testing
"""
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class SimpleHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()
    
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {
                "message": "DeFi Dojo API - Minimal Version",
                "version": "1.0.0",
                "status": "running",
                "python_version": os.sys.version,
                "endpoints": {
                    "/": "API information",
                    "/health": "Health check",
                    "/docs": "API documentation",
                    "/api/v1/quests/public": "Public quests (mock data)"
                }
            }
            self.wfile.write(json.dumps(response, indent=2).encode())
        elif self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {"status": "healthy", "environment": os.getenv("ENVIRONMENT", "development")}
            self.wfile.write(json.dumps(response, indent=2).encode())
        elif self.path == '/docs':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>DeFi Dojo API Documentation</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
                    .method { color: #007bff; font-weight: bold; }
                    .url { color: #28a745; font-family: monospace; }
                </style>
            </head>
            <body>
                <h1>DeFi Dojo API Documentation</h1>
                <p>Welcome to the DeFi Dojo API - Minimal Version</p>
                
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div class="url">/</div>
                    <p>Get API information and available endpoints</p>
                </div>
                
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div class="url">/health</div>
                    <p>Health check endpoint</p>
                </div>
                
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div class="url">/api/v1/quests/public</div>
                    <p>Get public quests (mock data)</p>
                </div>
                
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div class="url">/docs</div>
                    <p>This documentation page</p>
                </div>
            </body>
            </html>
            """
            self.wfile.write(html.encode())
        elif self.path == '/api/v1/quests/public':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = [
                {
                    "id": "liquidity-kata",
                    "slug": "liquidity-kata",
                    "title": "Liquidity Kata",
                    "description": "Master the art of providing liquidity to DeFi pools. Learn about AMM mechanics, impermanent loss, and yield optimization strategies.",
                    "difficulty": 1,
                    "reward_json": {"xp": 100, "badge": "Liquidity Provider", "badge_id": 1},
                    "active": True,
                    "created_at": "2024-01-15T10:00:00Z",
                    "updated_at": "2024-01-15T10:00:00Z"
                },
                {
                    "id": "yield-sprint",
                    "slug": "yield-sprint", 
                    "title": "Yield Sprint",
                    "description": "Optimize your yield farming strategies across multiple protocols. Learn about compound interest, risk management, and portfolio diversification.",
                    "difficulty": 2,
                    "reward_json": {"xp": 200, "badge": "Yield Farmer", "badge_id": 2},
                    "active": True,
                    "created_at": "2024-01-15T10:00:00Z",
                    "updated_at": "2024-01-15T10:00:00Z"
                }
            ]
            self.wfile.write(json.dumps(response, indent=2).encode())
        elif self.path == '/api/v1/quests/lightning-master':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {
                "id": "lightning-master",
                "slug": "lightning-master",
                "title": "Lightning Master",
                "description": "Master Bitcoin Lightning Network operations. Learn about payment channels, routing, and micro-transactions.",
                "difficulty": 3,
                "reward_json": {"xp": 300, "badge": "Lightning Warrior", "badge_id": 3},
                "active": True,
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-15T10:00:00Z"
            }
            self.wfile.write(json.dumps(response, indent=2).encode())
        elif self.path == '/api/v1/quests/defi-ninja':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {
                "id": "defi-ninja",
                "slug": "defi-ninja",
                "title": "DeFi Ninja",
                "description": "Become a DeFi protocol expert. Learn about smart contract interactions, gas optimization, and advanced trading strategies.",
                "difficulty": 4,
                "reward_json": {"xp": 500, "badge": "DeFi Ninja", "badge_id": 4},
                "active": True,
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-15T10:00:00Z"
            }
            self.wfile.write(json.dumps(response, indent=2).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {"error": "Not found", "available_endpoints": ["/", "/health", "/docs", "/api/v1/quests/public", "/api/v1/quests/lightning-master", "/api/v1/quests/defi-ninja"]}
            self.wfile.write(json.dumps(response, indent=2).encode())

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    server = HTTPServer(('0.0.0.0', port), SimpleHandler)
    print(f"Starting server on port {port}")
    server.serve_forever()
