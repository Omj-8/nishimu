package main

import (
	"fmt"
	"log"
	"net/http"
	"portfolio-backend/controllers"
	"portfolio-backend/database"
)

func main() {
	database.Connect()

	// ---------------------------
	// ルーティング設定
	// ---------------------------

	http.HandleFunc("/signup", controllers.Signup) // ★追加
    http.HandleFunc("/login", controllers.Login)   // ★追加

	// 一覧取得: /problems (完全一致)
	http.HandleFunc("/problems", controllers.GetAllProblems)

	// 詳細取得: /problems/ (前方一致でIDを受け取る)
	// 例: /problems/1
	http.HandleFunc("/problems/", controllers.GetProblemByID)

	fmt.Println("Backend server is running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}