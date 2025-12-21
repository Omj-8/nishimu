# Google Cloud Run デプロイメントガイド（Backend）

## 🚀 Cloud Run への簡単デプロイ

Cloud Runは、Dockerコンテナを自動スケーリングで実行できるサーバーレスプラットフォームです。

### 前提条件
- Google Cloud アカウント
- gcloud CLI のインストール
- Dockerのインストール

---

## デプロイ手順

### 1. gcloud CLIのセットアップ

```bash
# Google Cloud SDKのインストール（未インストールの場合）
# https://cloud.google.com/sdk/docs/install

# 認証
gcloud auth login

# プロジェクトの設定
gcloud config set project YOUR_PROJECT_ID

# Cloud Runの有効化
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2. Cloud SQLのセットアップ（PostgreSQL）

```bash
# Cloud SQLインスタンスの作成
gcloud sql instances create mahjong-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-northeast1

# データベースの作成
gcloud sql databases create portfolio_db --instance=mahjong-db

# ユーザーの作成
gcloud sql users create dbuser \
  --instance=mahjong-db \
  --password=YOUR_SECURE_PASSWORD
```

### 3. シークレットの設定（Secret Manager）

```bash
# Secret Managerの有効化
gcloud services enable secretmanager.googleapis.com

# シークレットの作成
echo -n "YOUR_JWT_SECRET" | gcloud secrets create jwt-secret --data-file=-
echo -n "YOUR_DB_PASSWORD" | gcloud secrets create db-password --data-file=-
```

### 4. Cloud Runへのデプロイ

```bash
cd backend

# Cloud Buildを使用してビルド・デプロイ
gcloud run deploy mahjong-backend \
  --source . \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars "DB_HOST=/cloudsql/YOUR_PROJECT_ID:asia-northeast1:mahjong-db" \
  --set-env-vars "DB_USER=dbuser" \
  --set-env-vars "DB_NAME=portfolio_db" \
  --set-env-vars "DB_PORT=5432" \
  --set-secrets "JWT_SECRET=jwt-secret:latest" \
  --set-secrets "DB_PASSWORD=db-password:latest" \
  --add-cloudsql-instances YOUR_PROJECT_ID:asia-northeast1:mahjong-db \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --port 8080
```

### 5. CORS設定の確認

デプロイ後、フロントエンドのURLをバックエンドのCORS設定に追加する必要があります。

---

## 🔄 GitHub Actions統合

`.github/workflows/deploy-cloudrun.yml`を使用して、GitHubからの自動デプロイを設定できます。

### 必要なシークレット（GitHub Secrets）
- `GCP_PROJECT_ID`: Google CloudプロジェクトID
- `GCP_SA_KEY`: サービスアカウントのJSONキー

### サービスアカウントの作成

```bash
# サービスアカウントの作成
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# 必要な権限を付与
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# キーの生成
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

生成された`key.json`の内容をGitHub SecretsにGCP_SA_KEYとして追加します。

---

## 💰 コスト見積もり

Cloud Runは使用した分だけ課金されます：
- **リクエストベース**: 月100万リクエストまで無料
- **CPU/メモリ**: 実行時間に応じた課金
- **Cloud SQL**: db-f1-micro（月額 約$7〜）

小規模アプリなら月額 $10-20程度で運用可能です。

---

## 📊 モニタリング

Cloud Runは自動的にCloud Monitoringと統合されています：

```bash
# ログの確認
gcloud run services logs read mahjong-backend --limit 50

# サービスの詳細
gcloud run services describe mahjong-backend --region asia-northeast1
```

---

## 🔒 セキュリティ強化

1. **認証の有効化**（オプション）
```bash
gcloud run services update mahjong-backend \
  --no-allow-unauthenticated \
  --region asia-northeast1
```

2. **カスタムドメイン設定**
```bash
gcloud run domain-mappings create \
  --service mahjong-backend \
  --domain api.yourdomain.com \
  --region asia-northeast1
```

---

## トラブルシューティング

### デプロイが失敗する場合
```bash
# ビルドログを確認
gcloud builds list --limit 5
gcloud builds log BUILD_ID
```

### データベース接続エラー
- Cloud SQLインスタンスが起動しているか確認
- Cloud SQL Proxyの設定を確認
- セキュリティグループ/ファイアウォールルールを確認
