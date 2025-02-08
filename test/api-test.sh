#!/bin/bash

# test/api-test.sh

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting API tests...${NC}"

# Wait for server to start
sleep 2

# Base URL
BASE_URL="http://localhost:3000/api"

# Test 1: Save a file
echo -e "\n${BLUE}Test 1: Saving a file...${NC}"
SAVE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"path": "test-config.json", "content": "{\\"test\\": \\"content\\"}"}' \
  "${BASE_URL}/files")

if [[ $SAVE_RESPONSE == *"File saved successfully"* ]]; then
  echo -e "${GREEN}✓ File save test passed${NC}"
else
  echo -e "${RED}✗ File save test failed${NC}"
  echo "Response: $SAVE_RESPONSE"
fi

# Test 2: Read the saved file
echo -e "\n${BLUE}Test 2: Reading the saved file...${NC}"
READ_RESPONSE=$(curl -s -X GET "${BASE_URL}/files/test-config.json")

if [[ $READ_RESPONSE == *"test"* && $READ_RESPONSE == *"content"* ]]; then
  echo -e "${GREEN}✓ File read test passed${NC}"
else
  echo -e "${RED}✗ File read test failed${NC}"
  echo "Response: $READ_RESPONSE"
fi

# Test 3: Try to read non-existent file
echo -e "\n${BLUE}Test 3: Reading non-existent file...${NC}"
ERROR_RESPONSE=$(curl -s -X GET "${BASE_URL}/files/non-existent.json")

if [[ $ERROR_RESPONSE == *"File not found"* ]]; then
  echo -e "${GREEN}✓ Non-existent file test passed${NC}"
else
  echo -e "${RED}✗ Non-existent file test failed${NC}"
  echo "Response: $ERROR_RESPONSE"
fi

echo -e "\n${BLUE}Tests completed!${NC}"