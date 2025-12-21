# AWS デプロイメントガイド（Backend）

## 🚀 AWS へのデプロイオプション

### オプション1: AWS Elastic Beanstalk（推奨・簡単）

#### 前提条件
- AWS CLIのインストール
- EB CLIのインストール: `pip install awsebcli`

#### デプロイ手順

1. **EB CLIの初期化**
```bash
cd backend
eb init -p docker mahjong-backend --region ap-northeast-1
```

2. **環境の作成**
```bash
eb create mahjong-backend-prod
```

3. **環境変数の設定**
```bash
eb setenv DB_HOST=your-rds-endpoint \
         DB_PORT=5432 \
         DB_USER=your-db-user \
         DB_PASSWORD=your-db-password \
         DB_NAME=portfolio_db \
         JWT_SECRET=your-jwt-secret \
         PORT=8080
```

4. **デプロイ**
```bash
eb deploy
```

5. **ステータス確認**
```bash
eb status
eb open
```

---

### オプション2: AWS ECS (Fargate)

#### 必要なリソース
- ECR（Docker イメージレジストリ）
- ECS Cluster
- ALB（Application Load Balancer）
- RDS（PostgreSQL）

#### デプロイ手順

1. **ECRリポジトリ作成**
```bash
aws ecr create-repository --repository-name mahjong-backend
```

2. **Dockerイメージのビルドとプッシュ**
```bash
# ECRにログイン
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com

# イメージをビルド
docker build -t mahjong-backend .

# タグ付け
docker tag mahjong-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/mahjong-backend:latest

# プッシュ
docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/mahjong-backend:latest
```

3. **ECS Task Definitionの作成**（task-definition.jsonを使用）

4. **ECS Serviceの作成**
```bash
aws ecs create-service \
  --cluster mahjong-cluster \
  --service-name mahjong-backend-service \
  --task-definition mahjong-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE
```

---

### オプション3: AWS App Runner（最もシンプル）

1. **App Runnerサービス作成**
   - AWSコンソールからApp Runnerを開く
   - 「Create service」をクリック
   - GitHubまたはECRをソースとして選択
   - ビルド設定を自動検出
   
2. **環境変数を設定**
   - コンソールから環境変数を追加

3. **デプロイ**
   - 自動的にデプロイが開始される

---

## 🗄️ RDS（PostgreSQL）のセットアップ

1. **RDSインスタンスの作成**
```bash
aws rds create-db-instance \
  --db-instance-identifier mahjong-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username admin \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-name portfolio_db
```

2. **セキュリティグループの設定**
   - バックエンドからのアクセスを許可（Port 5432）

---

## 🔐 セキュリティベストプラクティス

1. **環境変数の管理**
   - AWS Secrets Managerを使用
   - または AWS Systems Manager Parameter Storeを使用

2. **IAMロールの設定**
   - 最小権限の原則に従う
   - ECSタスク用のロールを作成

3. **VPCの設定**
   - プライベートサブネットにデータベースを配置
   - パブリックサブネットにALBを配置

---

## 💰 コスト最適化

- **開発環境**: t3.micro + RDS t3.micro（月額 $20-30）
- **本番環境**: t3.small + RDS t3.small（月額 $50-80）
- App Runnerは使用量に応じた課金

---

## 📊 モニタリング

1. **CloudWatch**
   - ログの集約
   - メトリクスの監視
   - アラームの設定

2. **X-Ray**（オプション）
   - 分散トレーシング
   - パフォーマンス分析

---

## 🔄 CI/CD統合

GitHub Actionsからの自動デプロイ設定（`.github/workflows/deploy-aws.yml`を参照）
