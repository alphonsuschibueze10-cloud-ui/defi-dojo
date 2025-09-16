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
                    "description": "Master the art of providing liquidity to DeFi pools",
                    "difficulty": 1,
                    "reward_json": {"xp": 100},
                    "active": True
                },
                {
                    "id": "yield-sprint",
                    "slug": "yield-sprint", 
                    "title": "Yield Sprint",
                    "description": "Optimize your yield farming strategies",
                    "difficulty": 2,
                    "reward_json": {"xp": 200},
                    "active": True
                }
            ]
            self.wfile.write(json.dumps(response, indent=2).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {"error": "Not found", "available_endpoints": ["/", "/health", "/docs", "/api/v1/quests/public"]}
            self.wfile.write(json.dumps(response, indent=2).encode())

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    server = HTTPServer(('0.0.0.0', port), SimpleHandler)
    print(f"Starting server on port {port}")
    server.serve_forever()
