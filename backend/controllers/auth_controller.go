package controllers

import (
	"encoding/json"
	"net/http"
	"portfolio-backend/database"
	"portfolio-backend/models"
)

// ユーザー登録 (Sign Up)
func Signup(w http.ResponseWriter, r *http.Request) {
	SetupResponse(&w)
	if r.Method == http.MethodOptions {
		return
	}

	var user models.User
	// フロントから送られてきたJSONを読み込む
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// デフォルトは "user" 権限にする
	if user.Role == "" {
		user.Role = "user"
	}

	// DBに保存
	result := database.DB.Create(&user)
	if result.Error != nil {
		http.Error(w, "Failed to create user (Email already exists?)", http.StatusInternalServerError)
		return
	}

	// パスワードを隠して返す
	user.Password = ""
	json.NewEncoder(w).Encode(user)
}

// ログイン (Login)
func Login(w http.ResponseWriter, r *http.Request) {
	SetupResponse(&w)
	if r.Method == http.MethodOptions {
		return
	}

	var input models.User
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var user models.User
	// メールアドレスで検索
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	// パスワード照合 (今回は平文比較。実務ではbcrypt等を使う)
	if user.Password != input.Password {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	// 成功したらユーザー情報を返す (パスワードは消す)
	user.Password = ""
	json.NewEncoder(w).Encode(user)
}