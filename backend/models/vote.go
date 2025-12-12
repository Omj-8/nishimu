package models

import "gorm.io/gorm"

type Vote struct {
	gorm.Model
	// 外部キー: どの問題に対する投票か
	ProblemID uint `json:"problem_id"`
	
	// 評価点 (0-100)
	Point int `json:"point"`
	
	// 将来的にはここに UserID や IPAddress を入れて重複投票を防ぎます
	// UserID string `json:"user_id"` 
}