package models

import "gorm.io/gorm"

// Todo モデル (外部から使うので頭文字は大文字のまま)
type Todo struct {
	gorm.Model
	Title string `json:"title"`
	Done  bool   `json:"done"`
}