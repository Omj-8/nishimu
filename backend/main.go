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

	http.HandleFunc("/signup", controllers.Signup)
    http.HandleFunc("/login", controllers.Login)
	// 投票機能
    http.HandleFunc("/votes", controllers.CastVote) // POST: 投票する

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