#!/bin/bash

# Run all tests with coverage
echo "Running Go tests with coverage..."
go test ./... -v -coverprofile=coverage.out

# Display coverage
echo ""
echo "Coverage summary:"
go tool cover -func=coverage.out

# Generate HTML coverage report (optional)
# go tool cover -html=coverage.out -o coverage.html
# echo "HTML coverage report generated: coverage.html"
