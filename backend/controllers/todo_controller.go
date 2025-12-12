package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	// 自分のモジュール名に合わせてインポート
	"portfolio-backend/database"
	"portfolio-backend/models"
)

// CORS許可などのヘッダー設定（共通関数）
func setupResponse(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

// /todos へのリクエストを処理 (GET, POST)
func HandleTodos(w http.ResponseWriter, r *http.Request) {
	setupResponse(&w)
	if r.Method == http.MethodOptions {
		return
	}

	if r.Method == http.MethodGet {
		// 一覧取得
		var todos []models.Todo
		if err := database.DB.Order("id asc").Find(&todos).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(todos)

	} else if r.Method == http.MethodPost {
		// 作成
		var todo models.Todo
		if err := json.NewDecoder(r.Body).Decode(&todo); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		database.DB.Create(&todo)
		json.NewEncoder(w).Encode(todo)
	}
}

// /todos/{id} へのリクエストを処理 (PUT, DELETE)
func HandleTodoByID(w http.ResponseWriter, r *http.Request) {
	setupResponse(&w)
	if r.Method == http.MethodOptions {
		return
	}

	// IDの抽出
	idStr := strings.TrimPrefix(r.URL.Path, "/todos/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	if r.Method == http.MethodPut {
		// 更新
		var todo models.Todo
		if err := database.DB.First(&todo, id).Error; err != nil {
			http.Error(w, "Todo not found", http.StatusNotFound)
			return
		}

		var input models.Todo
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		todo.Done = input.Done
		todo.Title = input.Title
		database.DB.Save(&todo)
		json.NewEncoder(w).Encode(todo)

	} else if r.Method == http.MethodDelete {
		// 削除
		if err := database.DB.Delete(&models.Todo{}, id).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"result": "success"})
	}
}