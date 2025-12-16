package controllers

import (
	"encoding/json"
	"net/http"
	"portfolio-backend/database"
	"portfolio-backend/models"
	"strconv"
	"strings"
)

// ユーザー一覧を取得 (GET /users)
func GetAllUsers(w http.ResponseWriter, r *http.Request) {
	SetupResponse(&w)
	if r.Method == http.MethodOptions {
		return
	}

	var users []models.User
	result := database.DB.Find(&users)
	if result.Error != nil {
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}

	// パスワードを隠す
	for i := range users {
		users[i].Password = ""
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// 特定ユーザーを削除 (DELETE /users/{id})
func DeleteUser(w http.ResponseWriter, r *http.Request) {
	SetupResponse(&w)
	if r.Method == http.MethodOptions {
		return
	}

	// URLからユーザーIDを抽出 (/users/123 -> 123)
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 3 {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(pathParts[2])
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// ユーザーを削除 (および関連する投票も削除)
	if err := database.DB.Delete(&models.User{}, userID).Error; err != nil {
		http.Error(w, "Failed to delete user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "User deleted successfully"})
}

// ユーザーの投票履歴と統計を取得 (GET /users/{id}/votes)
func GetUserVotes(w http.ResponseWriter, r *http.Request) {
	SetupResponse(&w)
	if r.Method == http.MethodOptions {
		return
	}

	// URLからユーザーIDを抽出 (/users/123/votes -> 123)
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 3 {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(pathParts[2])
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// ユーザーの投票を取得
	var votes []models.Vote
	database.DB.Where("user_id = ?", userID).Find(&votes)

	// 統計情報を計算
	if len(votes) == 0 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"user_id":       userID,
			"total_votes":   0,
			"average_score": 0,
			"votes":         []models.Vote{},
		})
		return
	}

	var sum float64
	var minScore, maxScore int = votes[0].Point, votes[0].Point

	for _, vote := range votes {
		sum += float64(vote.Point)
		if vote.Point < minScore {
			minScore = vote.Point
		}
		if vote.Point > maxScore {
			maxScore = vote.Point
		}
	}

	average := sum / float64(len(votes))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user_id":       userID,
		"total_votes":   len(votes),
		"average_score": average,
		"min_score":     minScore,
		"max_score":     maxScore,
		"votes":         votes,
	})
}
