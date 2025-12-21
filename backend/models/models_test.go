package models

import (
	"testing"
)

func TestUserModel(t *testing.T) {
	user := User{
		Email:    "test@example.com",
		Password: "password123",
		Username: "testuser",
		IsAdmin:  false,
	}

	if user.Email != "test@example.com" {
		t.Errorf("Expected email test@example.com, got %s", user.Email)
	}

	if user.Username != "testuser" {
		t.Errorf("Expected username testuser, got %s", user.Username)
	}

	if user.IsAdmin {
		t.Error("Expected IsAdmin to be false")
	}
}

func TestProblemModel(t *testing.T) {
	problem := Problem{
		Title:       "Test Problem",
		Hand:        "1m2m3m4m5m6m7m8m9m1p2p3p4p",
		TsumoTile:   "5p",
		DoraTile:    "1m",
		Wind:        "東",
		Round:       1,
		Points:      25000,
		Description: "Test description",
	}

	if problem.Title != "Test Problem" {
		t.Errorf("Expected title 'Test Problem', got %s", problem.Title)
	}

	if problem.Wind != "東" {
		t.Errorf("Expected wind '東', got %s", problem.Wind)
	}

	if problem.Points != 25000 {
		t.Errorf("Expected points 25000, got %d", problem.Points)
	}
}

func TestVoteModel(t *testing.T) {
	vote := Vote{
		ProblemID: 1,
		UserID:    1,
		Point:     85,
	}

	if vote.Point != 85 {
		t.Errorf("Expected point 85, got %d", vote.Point)
	}

	if vote.Point < 0 || vote.Point > 100 {
		t.Error("Vote point should be between 0 and 100")
	}
}
