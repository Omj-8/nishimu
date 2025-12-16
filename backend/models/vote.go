package models

import "gorm.io/gorm"

type Vote struct {
	gorm.Model
	// 外部キー: どの問題に対する投票か
	ProblemID uint `json:"problem_id"`
	
	// 外部キー: どのユーザーが投票したか
	UserID uint `json:"user_id"`
	
	// 評価点 (0-100)
	Point int `json:"point"`
}