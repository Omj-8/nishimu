package controllers

import (
	"encoding/json"
	"math"
	"net/http"
	"portfolio-backend/database"
	"portfolio-backend/models"
	"strconv"
)

// 投票を受け付ける (POST /votes)
func CastVote(w http.ResponseWriter, r *http.Request) {
	SetupResponse(&w)
	if r.Method == http.MethodOptions { return }

	var vote models.Vote
	if err := json.NewDecoder(r.Body).Decode(&vote); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// DBに保存
	if err := database.DB.Create(&vote).Error; err != nil {
		http.Error(w, "Failed to cast vote", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Vote casted!"})
}

// 結果を集計して返す (GET /problems/{id}/result?my_score=80)
func GetProblemResult(w http.ResponseWriter, r *http.Request) {
	SetupResponse(&w)
	if r.Method == http.MethodOptions { return }

	// 1. URLからProblemIDを取得
	// URL構造: /problems/{id}/result なので、少し強引ですがPathから取ります
	// 本来はChiやGinなどのルーターを使うと楽ですが、標準機能でやります
	//pathParts := r.URL.Path
	// 例: /problems/1/result -> IDは "1"
	// IDの抽出ロジック (簡易実装)
	var idStr string
	var problemID int
	
	// クエリパラメータから自分のスコアを取得 (?my_score=80)
	myScoreStr := r.URL.Query().Get("my_score")
	myScore, _ := strconv.Atoi(myScoreStr)

	// パス解析 (/problems/XX/result)
	// 単純化のため、IDは main.go のハンドリングで渡す前提にするか、ここでParseするか。
	// 今回は main.go で id を抽出するラッパーを書くのが面倒なので、
	// main.go で "/problems/" で受けて、ここで分解します。
	// 想定URL: /problems/1/result
	
	// ID抽出 (簡易的)
	// /problems/1/result -> [ "", "problems", "1", "result" ]
	// Goの標準ライブラリではパスパラメータの取得が面倒なので、
	// フロントから `?problem_id=1` で送ってもらう形に変更させてください（実装簡易化のため）
	
	idStr = r.URL.Query().Get("problem_id")
	problemID, _ = strconv.Atoi(idStr)

	// 2. この問題に対する全投票を取得
	var votes []models.Vote
	database.DB.Where("problem_id = ?", problemID).Find(&votes)

	if len(votes) == 0 {
		json.NewEncoder(w).Encode(models.ResultResponse{})
		return
	}

	// 3. 統計計算 (Mean, StdDev)
	var sum float64
	var values []float64
	
	// ヒストグラムの初期化 (10点刻み: 0-9, 10-19, ... 90-100)
	// 配列のインデックス 0->0~9, 1->10~19 ... 10->100
	histogramCounts := make([]int, 11)

	for _, v := range votes {
		score := float64(v.Point)
		sum += score
		values = append(values, score)

		// ヒストグラム集計
		idx := v.Point / 10
		if idx > 10 { idx = 10 } // 100点の場合
		histogramCounts[idx]++
	}

	count := float64(len(votes))
	average := sum / count

	// 分散と標準偏差
	var varianceSum float64
	for _, val := range values {
		varianceSum += math.Pow(val - average, 2)
	}
	variance := varianceSum / count
	stdDev := math.Sqrt(variance)

	// 4. 自分の偏差値を計算 (T-score)
	// 偏差値 = (得点 - 平均) / 標準偏差 * 10 + 50
	var deviationValue float64 = 50
	if stdDev > 0 {
		deviationValue = 50 + 10*(float64(myScore)-average)/stdDev
	}

	// 5. ヒストグラムデータを整形
	var histogramData []models.HistogramBin
	labels := []string{"0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80-89", "90-99", "100"}
	for i, c := range histogramCounts {
		histogramData = append(histogramData, models.HistogramBin{
			Range: labels[i],
			Count: c,
		})
	}

	// レスポンス作成
	response := models.ResultResponse{
		Average:   math.Round(average*10) / 10, // 小数点第1位まで
		StdDev:    math.Round(stdDev*10) / 10,
		UserScore: myScore,
		UserDev:   math.Round(deviationValue*10) / 10,
		VoteCount: int(count),
		Histogram: histogramData,
	}

	json.NewEncoder(w).Encode(response)
}