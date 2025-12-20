package main

import (
	"fmt"
	"log"
	"net/http"
	"portfolio-backend/controllers"
	"portfolio-backend/database"
	"strings"
)

func main() {
	database.Connect()

	// ---------------------------
	// ルーティング設定
	// ---------------------------

	// ルートとヘルスチェック
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"portfolio-backend"}`))
	})
	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	http.HandleFunc("/signup", controllers.Signup)
    http.HandleFunc("/login", controllers.Login)
	// 投票機能
    http.HandleFunc("/votes", controllers.CastVote) // POST: 投票する

	// ユーザー管理
	http.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			controllers.GetAllUsers(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// 一覧取得: /problems (完全一致)
	http.HandleFunc("/problems", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			controllers.CreateProblem(w, r)
		} else {
			controllers.GetAllProblems(w, r)
		}
	})

	http.HandleFunc("/results", controllers.GetProblemResult) 

	fmt.Println("Backend server is running...")

	// ユーザー詳細: /users/ (前方一致でIDを受け取る)
	// 例: DELETE /users/123 (ユーザー削除)
	http.HandleFunc("/users/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodDelete {
			controllers.DeleteUser(w, r)
		} else if strings.Contains(r.URL.Path, "/votes") {
			// /users/123/votes -> 投票履歴取得
			controllers.GetUserVotes(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// 詳細取得: /problems/ (前方一致でIDを受け取る)
	// 例: /problems/1
	http.HandleFunc("/problems/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodDelete {
			controllers.DeleteProblem(w, r)
		} else {
			controllers.GetProblemByID(w, r)
		}
	})

	fmt.Println("Backend server is running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}