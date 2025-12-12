package main

import (
	"fmt"
	"log"
	"net/http"

	// 作成したパッケージをインポート
	"portfolio-backend/controllers"
	"portfolio-backend/database"
)

func main() {
	// 1. データベース接続
	database.Connect()

	// 2. ルーティング (処理はcontrollersパッケージに丸投げ)
	http.HandleFunc("/todos", controllers.HandleTodos)
	http.HandleFunc("/todos/", controllers.HandleTodoByID)

	// 3. サーバー起動
	fmt.Println("Backend server is running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}