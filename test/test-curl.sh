curl -X POST \
  http://localhost:3000/api/files/update \
  -H "Content-Type: application/json" \
  -d '{
    "path": "test/example.md",
    "content": "# Test Content\n\nThis is a test file created via curl."
  }'