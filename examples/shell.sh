#!/bin/bash

# Test script for Boing API
# Configure these variables with your deployment details
API_URL="${BOING_API_URL:-<YOUR_API_URL_HERE>/api/send}"
AUTH_TOKEN="${BOING_AUTH_TOKEN:-<YOUR_AUTH_TOKEN_HERE>}"

# Check if auth token is set
if [[ "$AUTH_TOKEN" == *"<YOUR_"* ]]; then
  echo "Error: Please configure your API URL and auth token"
  echo "Set environment variables:"
  echo "  export BOING_API_URL=https://<YOUR_APP_NAME>.vercel.app/api/send"
  echo "  export BOING_AUTH_TOKEN=<YOUR_AUTH_TOKEN_HERE>"
  exit 1
fi

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Testing Boing API..."
echo "API URL: $API_URL"
echo ""

# Test 1: Simple notification
echo "Test 1: Sending simple notification..."
response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "title": "Test Notification",
    "message": "This is a test from the API test script"
  }')

if echo "$response" | grep -q '"status":"sent"'; then
  echo -e "${GREEN}✓ Test 1 passed${NC}"
else
  echo -e "${RED}✗ Test 1 failed${NC}"
  echo "Response: $response"
fi
echo ""

# Test 2: Notification with URL
echo "Test 2: Sending notification with URL..."
response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "title": "Link Test",
    "message": "Click to open GitHub",
    "url": "https://github.com"
  }')

if echo "$response" | grep -q '"status":"sent"'; then
  echo -e "${GREEN}✓ Test 2 passed${NC}"
else
  echo -e "${RED}✗ Test 2 failed${NC}"
  echo "Response: $response"
fi
echo ""

# Test 3: Notification with custom data
echo "Test 3: Sending notification with custom data..."
response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "title": "Data Test",
    "message": "Notification with custom data",
    "data": {
      "action": "test",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
    }
  }')

if echo "$response" | grep -q '"status":"sent"'; then
  echo -e "${GREEN}✓ Test 3 passed${NC}"
else
  echo -e "${RED}✗ Test 3 failed${NC}"
  echo "Response: $response"
fi
echo ""

echo "API tests complete!"