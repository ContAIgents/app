#!/bin/bash

# test/run-tests.sh

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Navigate to project root
cd ../cli

# Build the project
echo -e "${BLUE}Building project...${NC}"
npm run build

# Start the server in the background
echo -e "${BLUE}Starting server...${NC}"
node dist/index.js &
SERVER_PID=$!

# Run the tests
echo -e "${BLUE}Running tests...${NC}"
../test/api-test.sh

# Cleanup: Kill the server
echo -e "${BLUE}Cleaning up...${NC}"
kill $SERVER_PID