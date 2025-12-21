# Run all tests with coverage
Write-Host "Running Go tests with coverage..." -ForegroundColor Green
go test ./... -v -coverprofile=coverage.out

# Display coverage
Write-Host "`nCoverage summary:" -ForegroundColor Green
go tool cover -func=coverage.out

# Generate HTML coverage report (optional)
# go tool cover -html=coverage.out -o coverage.html
# Write-Host "HTML coverage report generated: coverage.html" -ForegroundColor Green
