# Vercel デプロイメントガイド

## 🚀 Vercelへのデプロイ手順

### 1. Vercelアカウントのセットアップ
1. [Vercel](https://vercel.com)にアクセスしてサインアップ
2. GitHubアカウントと連携

### 2. プロジェクトのインポート
1. Vercelダッシュボードから「New Project」をクリック
2. GitHubリポジトリを選択
3. Root Directoryを `frontend` に設定
4. Framework Presetは自動的に「Next.js」が選択される

### 3. 環境変数の設定
以下の環境変数をVercelプロジェクトの設定に追加：

```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

### 4. デプロイ設定
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 5. デプロイ実行
「Deploy」ボタンをクリックしてデプロイ開始

## 📝 継続的デプロイ

GitHubリポジトリにプッシュすると、Vercelが自動的に：
- プレビューデプロイメントを作成（Pull Request）
- 本番デプロイメントを実行（mainブランチへのマージ）

## 🔧 カスタムドメイン設定

1. Vercelダッシュボードの「Settings」→「Domains」
2. カスタムドメインを追加
3. DNSレコードを設定（Vercelが自動的に指示）

## 環境別設定

### Development
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Production
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## トラブルシューティング

### ビルドエラーが発生する場合
1. ローカルで `npm run build` が成功することを確認
2. Node.jsバージョンを確認（Vercelは最新LTS）
3. 環境変数が正しく設定されているか確認

### APIが接続できない場合
1. CORS設定を確認
2. バックエンドURLが正しいか確認
3. バックエンドが稼働しているか確認
