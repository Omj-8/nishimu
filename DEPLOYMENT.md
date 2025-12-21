# 📚 デプロイメント完全ガイド

麻雀 Evaluatorを本番環境にデプロイするための包括的なガイドです。

## 🎯 デプロイメント戦略

### 推奨構成
- **Frontend**: Vercel（最も簡単・高速）
- **Backend**: Cloud Run または AWS App Runner（サーバーレス）
- **Database**: Cloud SQL / AWS RDS（マネージドPostgreSQL）

---

## 📋 デプロイ前のチェックリスト

### 1. 環境変数の準備
- [ ] `.env.example`を参考に本番用の環境変数を準備
- [ ] JWT_SECRETを強力なランダム文字列に変更
- [ ] データベース認証情報を確保
- [ ] フロントエンドのAPI URLを確定

### 2. コードの準備
- [ ] すべてのテストが通過することを確認
- [ ] Dockerビルドが成功することを確認
- [ ] 本番用の最適化設定を適用

### 3. インフラの準備
- [ ] データベースインスタンスの作成
- [ ] ドメイン名の取得（オプション）
- [ ] SSL証明書の設定

---

## 🚀 デプロイ手順

### Option A: 最速デプロイ（Vercel + Cloud Run）

**時間: 約30分**

#### Frontend（Vercel）
1. GitHubリポジトリをVercelに接続
2. Root Directoryを`frontend`に設定
3. 環境変数`NEXT_PUBLIC_API_URL`を設定
4. デプロイ実行

詳細: [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

#### Backend（Cloud Run）
```bash
cd backend
gcloud run deploy mahjong-backend \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated
```

詳細: [CLOUDRUN_DEPLOY.md](./CLOUDRUN_DEPLOY.md)

---

### Option B: 本格的なAWSデプロイ

**時間: 約2-3時間**

より細かい制御とAWSエコシステムの活用が可能。

詳細: [AWS_DEPLOY.md](./AWS_DEPLOY.md)

---

## 🧪 デプロイ後のテスト

### 1. ヘルスチェック
```bash
# Backend
curl https://your-backend-url/healthz

# 期待される応答: "ok"
```

### 2. APIテスト
```bash
# ユーザー登録
curl -X POST https://your-backend-url/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","username":"testuser"}'

# 問題一覧取得
curl https://your-backend-url/problems
```

### 3. フロントエンドテスト
1. ブラウザでフロントエンドURLにアクセス
2. ユーザー登録・ログイン
3. 配牌投票
4. 結果表示の確認

---

## 📊 モニタリング設定

### 基本メトリクス
- **レスポンスタイム**: < 500ms
- **エラー率**: < 1%
- **稼働率**: > 99.9%

### 推奨ツール
- **APM**: New Relic / Datadog
- **ログ管理**: Logtail / Papertrail
- **エラートラッキング**: Sentry

---

## 🔒 セキュリティ対策

### 必須項目
- [ ] HTTPS通信の強制
- [ ] 環境変数の暗号化管理
- [ ] CORS設定の厳格化
- [ ] レート制限の実装
- [ ] SQLインジェクション対策（GORM使用で自動対応）
- [ ] XSS対策（Next.jsで自動対応）

### 推奨項目
- [ ] Web Application Firewall (WAF)
- [ ] DDoS保護
- [ ] 定期的なセキュリティスキャン
- [ ] 依存パッケージの脆弱性チェック

---

## 💰 コスト見積もり

### 小規模運用（月間1万PV程度）
- **Vercel**: 無料（Hobby Plan）
- **Cloud Run**: $5-10
- **Cloud SQL**: $7-15（db-f1-micro）
- **合計**: **約 $12-25/月**

### 中規模運用（月間10万PV程度）
- **Vercel**: $20（Pro Plan）
- **Cloud Run**: $20-50
- **Cloud SQL**: $50-100（db-g1-small）
- **合計**: **約 $90-170/月**

---

## 🔄 CI/CD設定

GitHubに設定済みのワークフロー：

### 自動テスト
- `.github/workflows/ci.yml`
- mainブランチへのpushでテスト実行

### 自動デプロイ
- `.github/workflows/deploy-cloudrun.yml`（Cloud Run用）
- `.github/workflows/deploy-aws.yml`（AWS用）
- mainブランチへのマージで自動デプロイ

---

## 🆘 トラブルシューティング

### データベース接続エラー
```
Error: Failed to connect to database
```

**解決策**:
1. データベースの接続情報を確認
2. ファイアウォールルールを確認
3. VPC/セキュリティグループの設定を確認

### CORS エラー
```
Access to fetch blocked by CORS policy
```

**解決策**:
バックエンドのCORS設定にフロントエンドのURLを追加

### ビルドエラー
```
Build failed
```

**解決策**:
1. ローカルでビルドが成功することを確認
2. 環境変数が正しく設定されているか確認
3. Node.js/Goのバージョンを確認

---

## 📞 サポート

問題が発生した場合は、各デプロイガイドの詳細セクションを参照してください：
- [Vercelデプロイ](./VERCEL_DEPLOY.md)
- [Cloud Runデプロイ](./CLOUDRUN_DEPLOY.md)
- [AWSデプロイ](./AWS_DEPLOY.md)

---

## 🎓 次のステップ

デプロイ完了後:
1. カスタムドメインの設定
2. アナリティクスの導入（Google Analytics等）
3. パフォーマンス最適化
4. SEO対策
5. ユーザーフィードバックの収集

Happy Deploying! 🚀
