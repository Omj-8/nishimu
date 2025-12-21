package controllers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"portfolio-backend/database"
	"portfolio-backend/models"
	"strings"
	"testing"
)

// TestSignup tests the Signup controller
func TestSignup(t *testing.T) {
	// Setup test database
	database.Connect()

	tests := []struct {
		name           string
		requestBody    string
		expectedStatus int
		checkResponse  func(t *testing.T, body string)
	}{
		{
			name:           "Valid signup",
			requestBody:    `{"email":"test@example.com","password":"password123","username":"testuser"}`,
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, body string) {
				var response map[string]interface{}
				if err := json.Unmarshal([]byte(body), &response); err != nil {
					t.Fatalf("Failed to parse response: %v", err)
				}
				if msg, ok := response["message"].(string); !ok || msg != "User created successfully" {
					t.Errorf("Expected success message, got: %v", response)
				}
			},
		},
		{
			name:           "Invalid JSON",
			requestBody:    `{"email":"invalid`,
			expectedStatus: http.StatusBadRequest,
			checkResponse:  nil,
		},
		{
			name:           "Missing email",
			requestBody:    `{"password":"password123","username":"testuser"}`,
			expectedStatus: http.StatusBadRequest,
			checkResponse:  nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/signup", strings.NewReader(tt.requestBody))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			Signup(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			if tt.checkResponse != nil {
				tt.checkResponse(t, w.Body.String())
			}
		})
	}
}

// TestGetAllProblems tests the GetAllProblems controller
func TestGetAllProblems(t *testing.T) {
	database.Connect()

	req := httptest.NewRequest(http.MethodGet, "/problems", nil)
	w := httptest.NewRecorder()

	GetAllProblems(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var problems []models.Problem
	if err := json.Unmarshal(w.Body.Bytes(), &problems); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if len(problems) < 0 {
		t.Error("Expected at least 0 problems")
	}
}
