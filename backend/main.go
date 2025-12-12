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

	// 麻雀アプリ用API
	http.HandleFunc("/problems/random", controllers.GetRandomProblem)

	fmt.Println("Backend server is running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}