package controllers

import (
	"encoding/json"
	"net/http"
	"portfolio-backend/database"
	"portfolio-backend/models"
	"strconv"
	"strings"
)

// CORS設定などの共通ヘッダー
func SetupResponse(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

// 1. 全件取得 (一覧ページ用)
func GetAllProblems(w http.ResponseWriter, r *http.Request) {
	SetupResponse(&w)
	if r.Method == http.MethodOptions {
		return
	}

	var problems []models.Problem
	// ID順に全て取得
	result := database.DB.Find(&problems)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(problems)
}

// 2. ID指定で1件取得 (詳細ページ用)
func GetProblemByID(w http.ResponseWriter, r *http.Request) {
	SetupResponse(&w)
	if r.Method == http.MethodOptions {
		return
	}

	// URLからIDを取り出す (/problems/1 -> "1")
	// Go標準のhttpライブラリだと少し原始的な方法になります
	idStr := strings.TrimPrefix(r.URL.Path, "/problems/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var problem models.Problem
	result := database.DB.First(&problem, id)
	if result.Error != nil {
		http.Error(w, "Problem not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(problem)
}

// 3. 問題の新規作成 (POST /problems)
func CreateProblem(w http.ResponseWriter, r *http.Request) {
	SetupResponse(&w)
	if r.Method == http.MethodOptions { return }

	var problem models.Problem
	// フロントから送られてくるJSONを解析
	if err := json.NewDecoder(r.Body).Decode(&problem); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// DBに保存
	if err := database.DB.Create(&problem).Error; err != nil {
		http.Error(w, "Failed to create problem", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(problem)
}

// 4. 問題の削除 (DELETE /problems/{id})
func DeleteProblem(w http.ResponseWriter, r *http.Request) {
	SetupResponse(&w)
	if r.Method == http.MethodOptions { return }

	idStr := strings.TrimPrefix(r.URL.Path, "/problems/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	// 物理削除 (本当に消す)
	result := database.DB.Unscoped().Delete(&models.Problem{}, id)
	if result.Error != nil {
		http.Error(w, "Failed to delete", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Deleted"})
}