#!/usr/bin/env python3
"""
DeFi Dojo API Demo Script
Tests all endpoints with curl-like functionality
"""

import requests
import json
import time
import uuid
from typing import Dict, Any, Optional


class APIDemo:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token: Optional[str] = None
        self.user_id: Optional[str] = None
        self.quest_id: Optional[str] = None
        self.user_quest_id: Optional[str] = None
        self.ai_run_id: Optional[str] = None
        
    def log(self, message: str, level: str = "INFO"):
        """Log message with timestamp"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
    
    def make_request(self, method: str, endpoint: str, data: Dict[Any, Any] = None, 
                    params: Dict[str, str] = None, headers: Dict[str, str] = None) -> requests.Response:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        
        if headers is None:
            headers = {}
        
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        headers["Content-Type"] = "application/json"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, params=params, headers=headers)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response
        except requests.exceptions.RequestException as e:
            self.log(f"Request failed: {e}", "ERROR")
            raise
    
    def test_health_check(self):
        """Test health check endpoint"""
        self.log("Testing health check...")
        response = self.make_request("GET", "/health")
        
        if response.status_code == 200:
            data = response.json()
            self.log(f"Health check passed: {data}")
            return True
        else:
            self.log(f"Health check failed: {response.status_code}", "ERROR")
            return False
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        self.log("Testing root endpoint...")
        response = self.make_request("GET", "/")
        
        if response.status_code == 200:
            data = response.json()
            self.log(f"Root endpoint: {data}")
            return True
        else:
            self.log(f"Root endpoint failed: {response.status_code}", "ERROR")
            return False
    
    def test_auth_flow(self):
        """Test authentication flow"""
        self.log("Testing authentication flow...")
        
        # Step 1: Get nonce
        self.log("Step 1: Getting nonce...")
        nonce_response = self.make_request("POST", "/api/v1/auth/nonce", {
            "address": "SP123456789"
        })
        
        if nonce_response.status_code != 200:
            self.log(f"Nonce request failed: {nonce_response.status_code}", "ERROR")
            return False
        
        nonce_data = nonce_response.json()
        nonce = nonce_data["nonce"]
        self.log(f"Received nonce: {nonce}")
        
        # Step 2: Verify signature (mock)
        self.log("Step 2: Verifying signature...")
        verify_response = self.make_request("POST", "/api/v1/auth/verify", {
            "address": "SP123456789",
            "signature": "mock_signature",
            "nonce": nonce
        })
        
        if verify_response.status_code != 200:
            self.log(f"Signature verification failed: {verify_response.status_code}", "ERROR")
            return False
        
        auth_data = verify_response.json()
        self.auth_token = auth_data["token"]
        self.user_id = auth_data["user"]["id"]
        self.log(f"Authentication successful! User ID: {self.user_id}")
        return True
    
    def test_quests_endpoints(self):
        """Test quest-related endpoints"""
        self.log("Testing quest endpoints...")
        
        # Get quests list
        self.log("Getting quests list...")
        quests_response = self.make_request("GET", "/api/v1/quests/")
        
        if quests_response.status_code != 200:
            self.log(f"Get quests failed: {quests_response.status_code}", "ERROR")
            return False
        
        quests_data = quests_response.json()
        self.log(f"Found {len(quests_data)} quests")
        
        if not quests_data:
            self.log("No quests available", "WARNING")
            return True
        
        # Use first quest
        self.quest_id = quests_data[0]["id"]
        self.log(f"Using quest: {quests_data[0]['title']} (ID: {self.quest_id})")
        
        # Start quest
        self.log("Starting quest...")
        start_response = self.make_request("POST", f"/api/v1/quests/{self.quest_id}/start", {})
        
        if start_response.status_code != 200:
            self.log(f"Start quest failed: {start_response.status_code}", "ERROR")
            return False
        
        start_data = start_response.json()
        self.user_quest_id = start_data["user_quest_id"]
        self.log(f"Quest started! User Quest ID: {self.user_quest_id}")
        
        # Submit quest action
        self.log("Submitting quest action...")
        action_response = self.make_request("POST", f"/api/v1/quests/{self.quest_id}/action", {
            "user_quest_id": self.user_quest_id,
            "action": "simulate_add_liquidity",
            "payload": {
                "pair": "STX/sBTC",
                "amount": 100
            }
        })
        
        if action_response.status_code != 200:
            self.log(f"Quest action failed: {action_response.status_code}", "ERROR")
            return False
        
        action_data = action_response.json()
        self.log(f"Quest action result: {action_data}")
        
        # Get quest status
        self.log("Getting quest status...")
        status_response = self.make_request("GET", f"/api/v1/quests/{self.user_quest_id}/status")
        
        if status_response.status_code != 200:
            self.log(f"Get quest status failed: {status_response.status_code}", "ERROR")
            return False
        
        status_data = status_response.json()
        self.log(f"Quest status: {status_data}")
        
        return True
    
    def test_ai_endpoints(self):
        """Test AI-related endpoints"""
        self.log("Testing AI endpoints...")
        
        if not self.user_quest_id:
            self.log("No user quest ID available for AI testing", "WARNING")
            return True
        
        # Request AI hint
        self.log("Requesting AI hint...")
        hint_response = self.make_request("POST", "/api/v1/ai/hint", {
            "user_id": self.user_id,
            "user_quest_id": self.user_quest_id,
            "context": {
                "quest_step": 1,
                "balances": {"STX": 1000, "sBTC": 0.1},
                "action_history": []
            }
        })
        
        if hint_response.status_code != 200:
            self.log(f"AI hint request failed: {hint_response.status_code}", "ERROR")
            return False
        
        hint_data = hint_response.json()
        self.ai_run_id = hint_data["ai_run_id"]
        self.log(f"AI hint requested! Run ID: {self.ai_run_id}")
        
        # Wait a bit for AI processing
        self.log("Waiting for AI processing...")
        time.sleep(2)
        
        # Get AI hint result
        self.log("Getting AI hint result...")
        result_response = self.make_request("GET", f"/api/v1/ai/hint/{self.ai_run_id}")
        
        if result_response.status_code != 200:
            self.log(f"Get AI hint result failed: {result_response.status_code}", "ERROR")
            return False
        
        result_data = result_response.json()
        self.log(f"AI hint result: {result_data}")
        
        return True
    
    def test_rewards_endpoints(self):
        """Test reward-related endpoints"""
        self.log("Testing reward endpoints...")
        
        if not self.user_quest_id:
            self.log("No user quest ID available for rewards testing", "WARNING")
            return True
        
        # Prepare reward
        self.log("Preparing reward...")
        prepare_response = self.make_request("POST", "/api/v1/rewards/prepare", {
            "user_quest_id": self.user_quest_id
        })
        
        if prepare_response.status_code != 200:
            self.log(f"Prepare reward failed: {prepare_response.status_code}", "ERROR")
            return False
        
        prepare_data = prepare_response.json()
        self.log(f"Reward prepared: {prepare_data}")
        
        # Execute reward (with mock signed transaction)
        self.log("Executing reward...")
        execute_response = self.make_request("POST", "/api/v1/rewards/execute", {
            "signed_tx": "mock_signed_transaction",
            "mint_payload_id": prepare_data["mint_payload_id"]
        })
        
        if execute_response.status_code != 200:
            self.log(f"Execute reward failed: {execute_response.status_code}", "ERROR")
            return False
        
        execute_data = execute_response.json()
        self.log(f"Reward executed: {execute_data}")
        
        # Check reward status
        if execute_data.get("txid"):
            self.log("Checking reward status...")
            status_response = self.make_request("GET", "/api/v1/rewards/status", 
                                              params={"txid": execute_data["txid"]})
            
            if status_response.status_code == 200:
                status_data = status_response.json()
                self.log(f"Reward status: {status_data}")
            else:
                self.log(f"Get reward status failed: {status_response.status_code}", "ERROR")
        
        return True
    
    def test_leaderboard_endpoints(self):
        """Test leaderboard endpoints"""
        self.log("Testing leaderboard endpoints...")
        
        # Get leaderboard
        self.log("Getting leaderboard...")
        leaderboard_response = self.make_request("GET", "/api/v1/leaderboard/", 
                                               params={"limit": "10"})
        
        if leaderboard_response.status_code != 200:
            self.log(f"Get leaderboard failed: {leaderboard_response.status_code}", "ERROR")
            return False
        
        leaderboard_data = leaderboard_response.json()
        self.log(f"Leaderboard: {len(leaderboard_data['entries'])} entries")
        
        # Get user rank
        if self.user_id:
            self.log("Getting user rank...")
            rank_response = self.make_request("GET", f"/api/v1/leaderboard/user/{self.user_id}")
            
            if rank_response.status_code == 200:
                rank_data = rank_response.json()
                self.log(f"User rank: {rank_data}")
            else:
                self.log(f"Get user rank failed: {rank_response.status_code}", "ERROR")
        
        return True
    
    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        self.log("Testing unauthorized access...")
        
        # Temporarily remove auth token
        original_token = self.auth_token
        self.auth_token = None
        
        # Try to access protected endpoint
        response = self.make_request("GET", "/api/v1/quests/")
        
        if response.status_code in [401, 403]:
            self.log("Unauthorized access correctly blocked")
            result = True
        else:
            self.log(f"Unauthorized access not blocked: {response.status_code}", "ERROR")
            result = False
        
        # Restore auth token
        self.auth_token = original_token
        
        return result
    
    def test_error_handling(self):
        """Test error handling"""
        self.log("Testing error handling...")
        
        # Test 404
        response = self.make_request("GET", "/api/v1/nonexistent")
        if response.status_code == 404:
            self.log("404 error handling works")
        else:
            self.log(f"404 error handling failed: {response.status_code}", "ERROR")
        
        # Test 422 (validation error)
        response = self.make_request("POST", "/api/v1/auth/nonce", {
            "invalid_field": "value"
        })
        if response.status_code == 422:
            self.log("422 validation error handling works")
        else:
            self.log(f"422 error handling failed: {response.status_code}", "ERROR")
        
        return True
    
    def run_all_tests(self):
        """Run all API tests"""
        self.log("Starting DeFi Dojo API Demo", "INFO")
        self.log("=" * 50)
        
        tests = [
            ("Health Check", self.test_health_check),
            ("Root Endpoint", self.test_root_endpoint),
            ("Authentication Flow", self.test_auth_flow),
            ("Quest Endpoints", self.test_quests_endpoints),
            ("AI Endpoints", self.test_ai_endpoints),
            ("Reward Endpoints", self.test_rewards_endpoints),
            ("Leaderboard Endpoints", self.test_leaderboard_endpoints),
            ("Unauthorized Access", self.test_unauthorized_access),
            ("Error Handling", self.test_error_handling),
        ]
        
        results = []
        
        for test_name, test_func in tests:
            self.log(f"\n--- {test_name} ---")
            try:
                result = test_func()
                results.append((test_name, result))
                if result:
                    self.log(f"✅ {test_name} PASSED")
                else:
                    self.log(f"❌ {test_name} FAILED", "ERROR")
            except Exception as e:
                self.log(f"❌ {test_name} ERROR: {e}", "ERROR")
                results.append((test_name, False))
        
        # Summary
        self.log("\n" + "=" * 50)
        self.log("TEST SUMMARY", "INFO")
        self.log("=" * 50)
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{test_name}: {status}")
        
        self.log(f"\nTotal: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 All tests passed!", "INFO")
        else:
            self.log(f"⚠️  {total - passed} tests failed", "WARNING")
        
        return passed == total


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="DeFi Dojo API Demo")
    parser.add_argument("--url", default="http://localhost:8000", 
                       help="Base URL for the API (default: http://localhost:8000)")
    parser.add_argument("--test", choices=[
        "health", "auth", "quests", "ai", "rewards", "leaderboard", "all"
    ], default="all", help="Specific test to run (default: all)")
    
    args = parser.parse_args()
    
    demo = APIDemo(args.url)
    
    if args.test == "all":
        success = demo.run_all_tests()
    else:
        test_map = {
            "health": demo.test_health_check,
            "auth": demo.test_auth_flow,
            "quests": demo.test_quests_endpoints,
            "ai": demo.test_ai_endpoints,
            "rewards": demo.test_rewards_endpoints,
            "leaderboard": demo.test_leaderboard_endpoints,
        }
        
        if args.test in test_map:
            success = test_map[args.test]()
        else:
            print(f"Unknown test: {args.test}")
            return 1
    
    return 0 if success else 1


if __name__ == "__main__":
    exit(main())
