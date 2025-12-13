package database

import (
	"fmt"
	"log"
	"os"
	
	"portfolio-backend/models" // モジュール名は合わせる

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	if err := godotenv.Load(); err != nil {
		log.Println("Note: .env file not found")
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Tokyo",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// 1. マイグレーション (テーブル作成)
	// Todo を削除し、Problem と Vote を追加
	err = DB.AutoMigrate(&models.Problem{}, &models.Vote{}, &models.User{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	fmt.Println("🚀 Database migrated!")

	// 2. シーディング (初期データ投入)
	seedDatabase()
}

// 初期データ投入関数
func seedDatabase() {
	var count int64
	DB.Model(&models.Problem{}).Count(&count)
	
	// データが0件ならサンプルを追加
	if count == 0 {
		fmt.Println("🌱 Seeding initial data...")
		
		// PDFにあったようなサンプル配牌 (ID表記)
		// 例: 1m, 2m, 3m ... のような適当な牌姿
		sampleProblem := models.Problem{
			HandTiles: "[0,1,2,9,10,11,18,19,20,27,27,31,31,32]", // JSON配列の文字列
			DoraTiles: "[28]", // ドラ表示牌: 發(28) -> ドラは中(29)
			Wind:      "East",
			Round:     "East-1",
			Score:     25000,
		}
		
		DB.Create(&sampleProblem)
		fmt.Println("✅ Sample problem created!")
	}
}