package controllers

import (
	"encoding/json"
	"net/http"
	"portfolio-backend/database"
	"portfolio-backend/models"
)

func SetupResponse(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

// GET /problems/random
// ランダムに1問（あるいは最新の1問）を返す
func GetRandomProblem(w http.ResponseWriter, r *http.Request) {
	SetupResponse(&w)
	if r.Method == http.MethodOptions {
		return
	}

	var problem models.Problem
	// 最初の1件を取得 (本来はランダム取得ロジックなどを書く)
	result := database.DB.First(&problem)
	
	if result.Error != nil {
		http.Error(w, "No problems found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(problem)
}