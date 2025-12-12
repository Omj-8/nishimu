package models

import "gorm.io/gorm"

type Problem struct {
	gorm.Model
	// 配牌データ: JSON形式の文字列として保存 (例: "[0,1,2,3...]")
	// PostgreSQLの配列型を使う方法もありますが、今回は扱いやすさ優先で文字列にします
	HandTiles string `json:"hand_tiles"` 
	
	// ドラ表示牌: JSON形式の文字列 (例: "[27]")
	DoraTiles string `json:"dora_tiles"`

	// 状況
	Wind  string `json:"wind"`  // 自風 (例: "East", "South")
	Round string `json:"round"` // 局 (例: "East-1")
	Score int    `json:"score"` // 持ち点 (例: 25000)

	// リレーション: この問題に対する投票データ
	Votes []Vote `json:"votes"` 
}