#!/usr/bin/env python3
"""
Test runner script for DeFi Dojo backend
Runs all tests with coverage reporting
"""

import subprocess
import sys
import os
from pathlib import Path


def run_command(command, description):
    """Run a command and return success status"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Command: {' '.join(command)}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(command, check=True, capture_output=False)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed with exit code {e.returncode}")
        return False
    except FileNotFoundError:
        print(f"❌ Command not found: {command[0]}")
        return False


def main():
    """Main test runner"""
    print("DeFi Dojo Backend Test Runner")
    print("=" * 60)
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Check if we're in a virtual environment
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️  Warning: Not in a virtual environment")
        print("Consider activating a virtual environment before running tests")
    
    # Install dependencies
    if not run_command([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      "Installing dependencies"):
        return 1
    
    # Run linting (if available)
    try:
        run_command([sys.executable, "-m", "flake8", "app", "--max-line-length=100"], 
                   "Code linting")
    except:
        print("⚠️  Flake8 not available, skipping linting")
    
    # Run type checking (if available)
    try:
        run_command([sys.executable, "-m", "mypy", "app", "--ignore-missing-imports"], 
                   "Type checking")
    except:
        print("⚠️  MyPy not available, skipping type checking")
    
    # Run tests with coverage
    test_commands = [
        # Unit tests
        [sys.executable, "-m", "pytest", "tests/", "-v", "--tb=short", 
         "--cov=app", "--cov-report=term-missing", "--cov-report=html:htmlcov",
         "--cov-fail-under=100", "-m", "not slow"],
        
        # Integration tests
        [sys.executable, "-m", "pytest", "tests/", "-v", "--tb=short", 
         "--cov=app", "--cov-report=term-missing", "--cov-report=html:htmlcov",
         "--cov-fail-under=100", "-m", "integration"],
        
        # All tests
        [sys.executable, "-m", "pytest", "tests/", "-v", "--tb=short", 
         "--cov=app", "--cov-report=term-missing", "--cov-report=html:htmlcov",
         "--cov-fail-under=100"]
    ]
    
    success = True
    
    for i, command in enumerate(test_commands):
        test_type = ["Unit tests", "Integration tests", "All tests"][i]
        if not run_command(command, test_type):
            success = False
            break
    
    # Generate coverage report
    if success:
        print(f"\n{'='*60}")
        print("Coverage Report")
        print(f"{'='*60}")
        
        try:
            # Try to open coverage report in browser
            import webbrowser
            coverage_file = backend_dir / "htmlcov" / "index.html"
            if coverage_file.exists():
                print(f"Coverage report generated: {coverage_file}")
                print("Opening coverage report in browser...")
                webbrowser.open(f"file://{coverage_file.absolute()}")
        except:
            print("Could not open coverage report in browser")
    
    # Summary
    print(f"\n{'='*60}")
    if success:
        print("🎉 All tests passed!")
        print("✅ 100% test coverage achieved")
        print("📊 Coverage report generated in htmlcov/")
    else:
        print("❌ Some tests failed")
        print("Check the output above for details")
    
    print(f"{'='*60}")
    
    return 0 if success else 1


if __name__ == "__main__":
    exit(main())
