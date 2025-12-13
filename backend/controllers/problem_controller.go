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