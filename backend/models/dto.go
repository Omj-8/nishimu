package models

// ResultResponse: 結果画面に必要な全データ
type ResultResponse struct {
	Average    float64 `json:"average"`     // 平均点
	StdDev     float64 `json:"std_dev"`     // 標準偏差
	UserScore  int     `json:"user_score"`  // あなたの点数
	UserDev    float64 `json:"user_dev"`    // あなたの偏差値
	VoteCount  int     `json:"vote_count"`  // 総投票数
	
	// グラフ用データ: [{"range": "0-10", "count": 2}, ...]
	Histogram  []HistogramBin `json:"histogram"` 
}

type HistogramBin struct {
	Range string `json:"range"` // ラベル (例: "50-60")
	Count int    `json:"count"` // 人数
}