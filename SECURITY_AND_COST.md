# 🔒 GitHub公開・デプロイ前のセキュリティチェックリスト

## ✅ 現在の状態（安全性評価）

### 🟢 安全な点
- ✅ 機密情報は環境変数で管理（ハードコードなし）
- ✅ `.gitignore`で`.env`ファイルを除外
- ✅ パスワードは平文でレスポンスから除外
- ✅ テストコードのパスワードは問題なし（ダミーデータ）

### 🟡 改善が必要な点
- ⚠️ パスワードが平文保存（ハッシュ化が必要）
- ⚠️ JWT実装が未完成
- ⚠️ CORS設定が緩い（すべて許可）
- ⚠️ レート制限がない（DDoS対策）

---

## 🚨 GitHub公開前に必ずチェック

### 1. .gitignoreの確認
```bash
# 以下のファイルが.gitignoreに含まれているか確認
- .env
- .env.local
- *.log
- postgres_data/
```

**現在の状態**: ✅ すでに設定済み

### 2. 機密情報の削除確認
```bash
# 以下を検索して機密情報がないか確認
git grep -i "password.*=" 
git grep -i "secret.*="
git grep -i "api.*key"
```

**現在の状態**: ✅ ハードコードなし

### 3. コミット履歴のチェック
```bash
# 過去のコミットに機密情報が含まれていないか確認
git log --all --full-history --source -S "password" --pretty=format:"%h %s"
```

もし機密情報が過去のコミットにある場合：
```bash
# 履歴から削除（慎重に！）
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

---

## 💰 料金について（詳細解説）

### GitHub Actions（CI/CD）

#### 無料枠
- **パブリックリポジトリ**: 完全無料・無制限 ✅
- **プライベートリポジトリ**: 月2,000分まで無料

#### 注意点
✅ **あなたのケース**: パブリックリポジトリなら完全無料
- テスト・ビルドが何回実行されても無料
- 複数ワークフローも無料

#### コスト発生のリスク
❌ **プライベートリポジトリで月2,000分を超える場合のみ**
- 超過分: $0.008/分（1,000分で約$8）

---

### Vercel（Frontend）

#### 無料枠（Hobby Plan）
- 月100GBの帯域幅
- 無制限のデプロイ
- プレビューデプロイ無制限
- 独自ドメイン対応

#### 制限
- 商用利用は不可（個人・趣味のみ）
- チームメンバー追加不可

#### コスト発生のリスク
✅ **通常の個人プロジェクトなら無料で十分**
❌ **以下の場合のみ有料**:
- 月100GB超える（月間100万PV以上相当）
- 商用利用する場合 → Pro Plan $20/月

#### 予期しない請求の防止
```
1. Vercelダッシュボード → Settings → Usage
2. アラート設定で帯域幅の上限を設定
3. 商用利用しない限り自動的にProにならない
```

---

### AWS（Backend）

#### ⚠️ 最も注意が必要

##### 無料枠（12ヶ月間）
- EC2 t2.micro: 月750時間
- RDS t2.micro: 月750時間
- データ転送: 月15GB

##### 無料枠終了後
- **継続的にコストが発生**
- 推定月額: $20-50（小規模の場合）

#### コスト発生のリスク
❌ **高リスク**:
1. インスタンスを起動したまま忘れる
2. データ転送量の超過
3. 無料枠終了後も自動継続

#### 予期しない請求の防止策
```
1. 予算アラートの設定（必須！）
   - AWS Billing → Budgets → Create budget
   - $5, $10でアラート設定

2. 無料利用枠アラート
   - AWS Billing → Preferences
   - "Receive Free Tier Usage Alerts"にチェック

3. コスト管理
   - 使わない時はインスタンスを停止
   - RDSは停止可能（7日間まで）
```

---

### Google Cloud Run（Backend - 推奨）

#### 無料枠（永続的）
- 月200万リクエスト
- 36万GB秒のメモリ
- 18万vCPU秒

#### 実質的な無料範囲
✅ **小規模アプリなら完全無料で運用可能**
- 月10万PV程度なら無料枠内
- リクエストがない時は課金されない（重要！）

#### コスト発生のリスク
✅ **低リスク**:
- 無料枠を超えても月$5-10程度
- 使った分だけの課金
- 自動スケールダウン（ゼロまで）

#### 予期しない請求の防止
```
1. 予算アラートの設定
   - Cloud Console → Billing → Budgets
   - $10でアラート設定

2. 最大インスタンス数の制限
   gcloud run services update SERVICE_NAME \
     --max-instances=10
```

---

### Cloud SQL / RDS（Database）

#### ⚠️ 注意が必要

##### 無料枠
- **AWS RDS**: 12ヶ月間のみ（db.t2.micro）
- **Cloud SQL**: 無料枠なし

##### 実際のコスト
- AWS RDS (t3.micro): 月$15-20
- Cloud SQL (db-f1-micro): 月$7-15

#### コスト削減策
✅ **開発段階での推奨**:
1. **ローカルDocker使用**（完全無料）
2. **Supabase無料プラン**（500MB、毎日2GB転送）
3. **Railway無料枠**（$5クレジット/月）
4. **Render無料プラン**（PostgreSQL 90日）

---

## 🎯 推奨デプロイ戦略（コスト別）

### 完全無料（学習・開発段階）
```
Frontend: Vercel (Hobby - 無料)
Backend: Cloud Run（無料枠内）
Database: Supabase（無料プラン）
CI/CD: GitHub Actions（パブリックリポジトリ）

月額: $0
```

### 低コスト（本番運用開始）
```
Frontend: Vercel (Hobby - 無料)
Backend: Cloud Run（無料枠超過分 $5-10）
Database: Cloud SQL db-f1-micro ($7-15)
CI/CD: GitHub Actions（無料）

月額: $12-25
```

### 商用利用
```
Frontend: Vercel Pro ($20)
Backend: Cloud Run ($20-50)
Database: Cloud SQL db-g1-small ($50-100)
CI/CD: GitHub Actions（無料）

月額: $90-170
```

---

## 📋 公開前の最終チェックリスト

### セキュリティ
- [ ] `.env`ファイルがコミットされていないか確認
- [ ] `.gitignore`が正しく設定されているか確認
- [ ] ハードコードされた機密情報がないか確認
- [ ] `docker-compose.yml`のパスワードを変更（ローカルのみ使用）

### コスト管理
- [ ] 使用するサービスの無料枠を確認
- [ ] 予算アラートを設定（AWS/GCP）
- [ ] 自動スケーリングの上限を設定
- [ ] 開発段階ではローカルDBを使用

### 機能
- [ ] ローカルでテストが通ることを確認
- [ ] Dockerビルドが成功することを確認
- [ ] READMEにセットアップ手順を記載

---

## ⚠️ 絶対にやってはいけないこと

1. ❌ `.env`ファイルをコミット
2. ❌ AWSクレデンシャルをコミット
3. ❌ パスワードのハードコード
4. ❌ AWS予算アラートなしでインスタンス起動
5. ❌ 公開リポジトリにAPI keyを記載
6. ❌ 本番DBの認証情報をコードに記載

---

## ✅ 今すぐできる安全な公開手順

1. **ローカルで確認**
```bash
# .envが含まれていないことを確認
git status
git ls-files | grep -i ".env"  # 何も表示されなければOK
```

2. **GitHubに公開**
```bash
git add .
git commit -m "Initial commit: Mahjong Evaluator"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

3. **この時点で発生する料金: $0** ✅
   - GitHub Actions（パブリックリポジトリ）: 無料
   - コードの保存: 無料

4. **デプロイは後で判断**
   - まずはGitHubに公開
   - デプロイは必要になったら実施
   - 無料枠内で試せる

---

## 🎓 まとめ

### GitHub公開は安全？
✅ **YES** - 以下の条件を満たせば安全：
- `.env`ファイルがgitignoreされている
- 機密情報がハードコードされていない
- 現在のコードは上記を満たしています

### お金はかかる？
✅ **基本的にNO（以下の場合）**:
- GitHubにコードを公開するだけ → 無料
- GitHub Actionsでテスト → 無料（パブリックリポジトリ）
- Vercelにデプロイ → 無料（Hobby Plan、月100GB以内）
- Cloud Runにデプロイ → ほぼ無料（小規模なら無料枠内）

⚠️ **注意が必要**:
- AWSは予算アラート設定必須
- データベースは開発段階ではローカル推奨
- 商用利用する場合は有料プラン検討

**推奨**: まずGitHubに公開し、Vercelで試してみる。完全無料で実践できます！
