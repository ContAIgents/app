#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Building frontend...${NC}"

# Navigate to frontend directory and build
cd frontend
yarn install
yarn build

if [ $? -ne 0 ]; then
    echo -e "${RED}Frontend build failed${NC}"
    exit 1
fi

echo -e "${BLUE}Creating CLI public directory...${NC}"

# Create public directory in CLI if it doesn't exist
mkdir -p ../cli/public

echo -e "${BLUE}Copying frontend dist files to CLI public directory...${NC}"

# Remove existing files in CLI public directory
rm -rf ../cli/public/*

# Copy frontend dist files to CLI public directory
cp -r dist/* ../cli/public/

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to copy dist files${NC}"
    exit 1
fi

echo -e "${BLUE}Building CLI...${NC}"

# Navigate to CLI directory and build
cd ../cli
npm install
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}CLI build failed${NC}"
    exit 1
fi

echo -e "${GREEN}Build completed successfully!${NC}"