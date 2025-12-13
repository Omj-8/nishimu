package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	// ユニーク制約: 同じメアドで複数登録できないようにする
	Email    string `gorm:"unique" json:"email"`
	Password string `json:"password"` // 本来はハッシュ化すべきですが、まずは平文で進めます
	Name     string `json:"name"`
	Role     string `json:"role"`     // "admin" or "user"
}