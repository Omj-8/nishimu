package database

import (
	"fmt"
	"log"
	"os" // OSの環境変数を読むため

	"portfolio-backend/models"

	"github.com/joho/godotenv" // インストールしたライブラリ
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	// .envファイルを読み込む
	// 読み込めなくても、本番環境(Docker内など)では環境変数が直接設定されている場合があるのでFatalにはしないのが一般的だが
	// 今回は開発用なのでエラーログを出すようにしておく
	if err := godotenv.Load(); err != nil {
		log.Println("Note: .env file not found")
	}

	// 環境変数から値を取得
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	// DSN文字列を組み立てる
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Tokyo",
		host, user, password, dbname, port,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	DB.AutoMigrate(&models.Todo{})
	fmt.Println("🚀 Database connected!")
}