# 麻雀 Evaluator - アーキテクチャ・コードレビュー完全ガイド

## 📋 目次
1. [プロジェクト概要](#プロジェクト概要)
2. [全体アーキテクチャ](#全体アーキテクチャ)
3. [バックエンド構造（Go）](#バックエンド構造go)
4. [フロントエンド構造（Next.js）](#フロントエンド構造nextjs)
5. [API設計](#api設計)
6. [ベストプラクティス評価](#ベストプラクティス評価)
7. [改善提案](#改善提案)

---

## プロジェクト概要

### 🎯 アプリケーションの目的
麻雀の配牌（初期14枚）を0～100点で投票し、集合知によって配牌の価値を統計的に分析するWebプラットフォーム。

### 👥 ユーザーペルソナ
- **一般ユーザー**: 配牌を投票して、自分の評価がどの位置にいるか確認
- **管理者**: 新しい配牌問題を作成・削除し、コンテンツを管理

### 💾 主要データ
- **Problems**: 配牌問題（手牌13枚+ツモ1枚、ドラ情報、風、局数、持ち点）
- **Votes**: 各ユーザーの投票（問題ID、ユーザーID、点数）
- **Users**: ユーザー管理（メール、パスワード、権限）

---

## 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                      ユーザーブラウザ                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
      ┌──────────┐         ┌──────────┐
      │ Frontend │         │  Admin   │
      │Next.js   │         │ Console  │
      │ React 19 │         │(Browser) │
      └────┬─────┘         └────┬─────┘
           │                    │
           │ REST API           │
           │ (JSON over HTTP)   │
           └──────────┬─────────┘
                      ▼
           ┌──────────────────────┐
           │   Backend Server     │
           │  Go (Standard HTTP)  │
           │  Port 8080           │
           └──────────┬───────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
    ┌─────────┐ ┌────────┐ ┌─────────────┐
    │ CORS    │ │ Models │ │ Controllers │
    │ Helpers │ │        │ │             │
    └─────────┘ └────────┘ └─────────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │   PostgreSQL 15      │
           │  Database (Docker)   │
           └──────────────────────┘
```

### 🔄 通信フロー例（投票～結果表示）

1. **フロント**: `/problems/1` ページを表示
2. **バック**: `GET /problems/1` → 配牌データを返す
3. **ユーザー**: スライダーで「85点」と評価
4. **フロント**: `POST /votes` → `{problem_id: 1, user_id: 5, point: 85}`
5. **バック**: 投票を保存 → `{"message": "Vote casted!"}`
6. **フロント**: `GET /results?problem_id=1&my_score=85`
7. **バック**: 
   - 全投票を取得（1号問題に対する全ユーザーの投票）
   - 統計計算：平均、標準偏差、偏差値
   - ヒストグラム生成
   - JSON返却
8. **フロント**: グラフ表示、偏差値表示

---

## バックエンド構造（Go）

### 📁 ファイル構成

```
backend/
├── main.go                 # ルーティング設定、サーバー起動
├── go.mod                  # 依存ライブラリ管理
├── database/
│   └── database.go         # DB接続、マイグレーション、シード
├── models/
│   ├── user.go             # Userモデル
│   ├── problem.go          # Problemモデル
│   ├── vote.go             # Voteモデル
│   └── dto.go              # APIレスポンス型定義
└── controllers/
    ├── auth_controller.go      # サインアップ、ログイン
    ├── problem_controller.go   # 問題CRUD
    ├── vote_controller.go      # 投票、統計計算
    └── user_controller.go      # ユーザー管理
```

### 🏗️ アーキテクチャパターン: MVC

このプロジェクトは **MVC (Model-View-Controller)** パターンを採用しています：

- **Model** (`models/`): データ構造定義
  - GORM の `gorm.Model` を継承して自動タイムスタンプなど
  - データベーススキーマを決定

- **Controller** (`controllers/`): ビジネスロジック
  - HTTPリクエスト処理
  - データベース操作の呼び出し
  - JSONエンコード・デコード
  - エラーハンドリング

- **View**: JSON（このプロジェクトではRESTful）
  - フロントエンドが消費するJSONレスポンス

### 🔑 主要なコンポーネント解説

#### 1. **Models** - データ構造

```go
// Problem: 配牌問題
type Problem struct {
    gorm.Model      // ID, CreatedAt, UpdatedAt, DeletedAt を自動付与
    HandTiles string // "[0,1,2,...]" JSON形式の牌配列
    DoraTiles string // "[28]" ドラ表示牌
    Wind string      // "East", "South" など
    Round string     // "East-1" など
    Score int        // 持ち点（25000など）
    Votes []Vote     // リレーション: この問題への投票
}

// Vote: 投票
type Vote struct {
    gorm.Model
    ProblemID uint  // 問題ID（外部キー）
    UserID uint     // ユーザーID（外部キー）
    Point int       // スコア 0～100
}

// User: ユーザー
type User struct {
    gorm.Model
    Email string    // ユニーク制約あり
    Password string // 平文保存（⚠️ セキュリティ問題あり）
    Role string     // "user", "admin"
}
```

**ポイント**:
- `gorm.Model`: GORM が提供する埋め込み構造体
  - `ID`: 自動採番される主キー
  - `CreatedAt`, `UpdatedAt`: タイムスタンプ自動管理
  - `DeletedAt`: 論理削除用（ソフトデリート）

#### 2. **Database接続** - `database.go`

```go
func Connect() {
    // 1. 環境変数から DB接続情報を取得
    dsn := fmt.Sprintf("host=%s user=%s password=%s ...",
        os.Getenv("DB_HOST"),
        os.Getenv("DB_USER"),
        ...
    )
    
    // 2. PostgreSQL に接続
    DB, _ = gorm.Open(postgres.Open(dsn), &gorm.Config{})
    
    // 3. マイグレーション（テーブル作成）
    DB.AutoMigrate(&models.Problem{}, &models.Vote{}, &models.User{})
    
    // 4. シーディング（初期データ投入）
    seedDatabase()
}
```

**ベストプラクティス**:
✅ 環境変数で DB 接続情報を分離  
✅ AutoMigrate で schema を go のコードで管理  
✅ 起動時に初期データを投入  

#### 3. **Controllers** - API 処理

**Signup/Login** (`auth_controller.go`):
```go
func Signup(w http.ResponseWriter, r *http.Request) {
    // 1. CORS 設定
    SetupResponse(&w)
    
    // 2. リクエストボディを JSON デコード
    var user models.User
    json.NewDecoder(r.Body).Decode(&user)
    
    // 3. デフォルト権限を設定
    if user.Role == "" {
        user.Role = "user"
    }
    
    // 4. DB に保存
    database.DB.Create(&user)
    
    // 5. パスワード隠して返却
    user.Password = ""
    json.NewEncoder(w).Encode(user)
}
```

**投票・統計** (`vote_controller.go`):
```go
func GetProblemResult(w http.ResponseWriter, r *http.Request) {
    // 1. URL パラメータから problem_id, my_score を取得
    problemID := r.URL.Query().Get("problem_id")
    myScore := r.URL.Query().Get("my_score")
    
    // 2. その問題の全投票を取得
    var votes []models.Vote
    database.DB.Where("problem_id = ?", problemID).Find(&votes)
    
    // 3. 統計計算
    // - 平均値: sum / count
    // - 標準偏差: sqrt(分散)
    // - 偏差値（T-score）: 50 + 10 * (自分のスコア - 平均) / 標準偏差
    
    // 4. ヒストグラム集計（10点刻み）
    // 0-9, 10-19, 20-29, ... 100
    
    // 5. JSON で返却
    json.NewEncoder(w).Encode(resultResponse)
}
```

#### 4. **ルーティング** (`main.go`)

```go
// Go 標準ライブラリの http.HandleFunc を使用
// 第1引数: パターン（完全一致または前方一致）
// 第2引数: ハンドラー関数

// 完全一致ルート
http.HandleFunc("/signup", controllers.Signup)
http.HandleFunc("/login", controllers.Login)
http.HandleFunc("/votes", controllers.CastVote)

// 前方一致ルート（Goの特性）
http.HandleFunc("/users/", func(w http.ResponseWriter, r *http.Request) {
    if r.Method == http.MethodDelete {
        controllers.DeleteUser(w, r)
    } else if strings.Contains(r.URL.Path, "/votes") {
        controllers.GetUserVotes(w, r)
    }
})

http.HandleFunc("/problems/", func(w http.ResponseWriter, r *http.Request) {
    if r.Method == http.MethodDelete {
        controllers.DeleteProblem(w, r)
    } else {
        controllers.GetProblemByID(w, r)
    }
})
```

**特徴**:
- Go 標準 `net/http` ライブラリのみ使用（依存少ない）
- ラッパーハンドラーで HTTP メソッドを分岐
- ID 抽出が少し原始的（後述）

---

## フロントエンド構造（Next.js）

### 📁 ファイル構成

```
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── globals.css   # グローバルスタイル
│   │   ├── layout.tsx    # ルートレイアウト
│   │   ├── page.tsx      # ランディングページ
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── problems/
│   │   │   ├── page.tsx          # 問題一覧
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # 投票ページ
│   │   │       └── result/
│   │   │           └── page.tsx  # 結果表示
│   │   └── admin/
│   │       ├── page.tsx          # ダッシュボード
│   │       ├── users/
│   │       │   └── page.tsx
│   │       └── create/
│   │           └── page.tsx
│   ├── components/
│   │   └── Header.tsx
│   └── utils/
│       └── mahjong.ts    # 麻雀ロジック（牌変換など）
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.mjs
└── postcss.config.mjs
```

### 🏗️ アーキテクチャパターン: App Router + Server/Client Components

#### **Next.js App Router の特徴**

- `/app` ディレクトリベースのファイルシステムルーティング
- `page.tsx` が各パスのメインコンポーネント
- `[id]` で動的ルート（例: `/problems/5`）
- サーバーコンポーネント（デフォルト）とクライアントコンポーネント（`'use client'`）を混在

#### **主要ページの役割**

| ページ | 機能 | 重要度 |
|--------|------|--------|
| `/` | ランディング | ⭐⭐ 初心者向けのUIパターン |
| `/login`, `/signup` | 認証 | ⭐⭐ フォーム処理学習 |
| `/problems` | 問題一覧 | ⭐⭐ データフェッチング |
| `/problems/[id]` | 投票 | ⭐⭐⭐ インタラクティブUI |
| `/problems/[id]/result` | 結果表示 | ⭐⭐⭐ データ可視化（Recharts） |
| `/admin/*` | 管理画面 | ⭐ 権限管理 |

#### **フロントエンドの主要技術**

1. **React 19** - UI フレームワーク
   - Hooks (`useState`, `useEffect`, `useContext`)
   - Server/Client Component の棲み分け

2. **TypeScript** - 型安全性
   - `Problem`, `Vote` などの型定義

3. **Tailwind CSS** - スタイリング
   - ユーティリティファースト
   - レスポンシブデザイン（`md:`, `lg:` プレフィックス）

4. **Recharts** - グラフ描画
   - ヒストグラム表示（結果ページ）

#### **ランディングページの例** (`/page.tsx`)

```tsx
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      {/* グラデーション背景 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-3xl"></div>
      
      {/* メインコンテンツ */}
      <h1 className="text-6xl md:text-7xl font-extrabold">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
          麻雀
        </span>
        <br />
        Evaluator
      </h1>
      
      {/* 行動喚起ボタン */}
      <Link href="/login">ログイン</Link>
      <Link href="/signup">新規登録</Link>
    </div>
  );
}
```

**ポイント**:
- `bg-gradient-to-r`, `blur-3xl` → Tailwind の高度な機能
- `md:text-7xl` → モバイルは大きめ、タブレット以上はさらに大きく
- `text-transparent bg-clip-text` → テキストをグラデーション化

#### **投票ページの例** (`/problems/[id]/page.tsx`)

```tsx
'use client';  // クライアント側でのみ実行

export default function VotingPage({ params }: { params: { id: string } }) {
    const [score, setScore] = useState(50);
    const [votes, setVotes] = useState([]);
    
    const handleVote = async () => {
        // POST /votes
        const res = await fetch('http://localhost:8080/votes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                problem_id: params.id,
                user_id: userID,  // セッションから取得
                point: score,
            }),
        });
        // 成功時に /problems/[id]/result へ遷移
        router.push(`/problems/${params.id}/result?my_score=${score}`);
    };
    
    return (
        <div>
            <input 
                type="range" 
                min="0" 
                max="100" 
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
            />
            <button onClick={handleVote}>投票する</button>
        </div>
    );
}
```

---

## API設計

### 📊 RESTful API 仕様

#### **ベースURL**
```
http://localhost:8080
```

#### **認証関連**

| メソッド | パス | 説明 | リクエスト | レスポンス (200) |
|---------|------|------|-----------|-------------------|
| POST | `/signup` | ユーザー登録 | `{ email, password, name }` | `{ id, email, role, ... }` |
| POST | `/login` | ログイン | `{ email, password }` | `{ id, email, role, ... }` |

**例**:
```bash
curl -X POST http://localhost:8080/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"Taro"}'
```

#### **問題管理（CRUD）**

| メソッド | パス | 説明 | リクエスト | レスポンス |
|---------|------|------|-----------|-----------|
| GET | `/problems` | 全問題取得 | - | `[{id, hand_tiles, ...}]` |
| POST | `/problems` | 問題作成 | `{ hand_tiles, dora_tiles, wind, round, score }` | `{ id, ... }` |
| GET | `/problems/{id}` | 問題詳細 | - | `{ id, hand_tiles, ... }` |
| DELETE | `/problems/{id}` | 問題削除 | - | `{ message: "deleted" }` |

**例**:
```bash
# 全問題取得
curl http://localhost:8080/problems

# 問題作成（管理者）
curl -X POST http://localhost:8080/problems \
  -H "Content-Type: application/json" \
  -d '{
    "hand_tiles": "[0,1,2,9,10,11,18,19,20,27,27,31,31]",
    "dora_tiles": "[28]",
    "wind": "East",
    "round": "East-1",
    "score": 25000
  }'

# 特定の問題を取得
curl http://localhost:8080/problems/1

# 問題削除
curl -X DELETE http://localhost:8080/problems/1
```

#### **投票 & 統計**

| メソッド | パス | 説明 | リクエスト | レスポンス |
|---------|------|------|-----------|-----------|
| POST | `/votes` | 投票 | `{ problem_id, user_id, point }` | `{ message: "Vote casted!" }` |
| GET | `/results` | 統計結果 | `?problem_id=1&my_score=85` | `{ average, std_dev, user_dev, histogram }` |

**例**:
```bash
# 投票
curl -X POST http://localhost:8080/votes \
  -H "Content-Type: application/json" \
  -d '{"problem_id": 1, "user_id": 5, "point": 85}'

# 統計結果取得
curl "http://localhost:8080/results?problem_id=1&my_score=85"

# レスポンス例:
# {
#   "average": 72.5,
#   "std_dev": 15.3,
#   "user_score": 85,
#   "user_dev": 58.2,  # 偏差値
#   "vote_count": 24,
#   "histogram": [
#     { "range": "0-9", "count": 1 },
#     { "range": "10-19", "count": 2 },
#     ...
#   ]
# }
```

#### **ユーザー管理**

| メソッド | パス | 説明 | リクエスト | レスポンス |
|---------|------|------|-----------|-----------|
| GET | `/users` | 全ユーザー取得 | - | `[{id, email, role}]` |
| GET | `/users/{id}/votes` | ユーザーの投票履歴 | - | `[{problem_id, point, ...}]` |
| DELETE | `/users/{id}` | ユーザー削除 | - | `{ message: "deleted" }` |

### 📐 API設計の評価

#### ✅ 良い点
1. **シンプル** - 余計な複雑さがない
2. **RESTful** - HTTP メソッドに従っている（POST=作成、GET=取得、DELETE=削除）
3. **JSON** - 言語非依存、業界標準
4. **CORS対応** - フロント・バック分離に対応

#### ⚠️ 改善が必要な点

1. **認証方式が不明確**
   - JWT? Session? 現在は `user_id` をフロントで管理している？
   - ログイン時にトークンを返す必要がある

2. **エラーレスポンスの統一がない**
   ```go
   // 統一されていない例:
   http.Error(w, "User not found", http.StatusUnauthorized)  // エラーメッセージのみ
   json.NewEncoder(w).Encode(user)  // JSON構造で返す
   ```
   **改善案**:
   ```json
   {
     "error": true,
     "message": "User not found",
     "code": "USER_NOT_FOUND"
   }
   ```

3. **ページネーションがない**
   - `/problems` で大量のデータを返す場合、パフォーマンス低下
   - `?page=1&limit=20` などのサポートが必要

4. **キャッシュ戦略がない**
   - `GET /problems` は頻繁に呼ばれるが、キャッシュヘッダーがない
   - `Cache-Control: max-age=300` などを設定

5. **バージョニング戦略がない**
   - API が進化した時、`/v1/problems`, `/v2/problems` のような対応が困難

---

## ベストプラクティス評価

### 🎯 バックエンド（Go）

#### ✅ 実装されている良いプラクティス

| 項目 | 現状 | 説明 |
|------|------|------|
| 環境変数分離 | ✅ | `.env` で DB接続情報を管理 |
| ORM使用 | ✅ | GORM で SQL インジェクション対策 |
| マイグレーション | ✅ | `AutoMigrate` でスキーマをコード化 |
| 構造化（MVC） | ✅ | model, controller, database を分離 |
| JSON処理 | ✅ | `json.NewDecoder` で安全にパース |

#### ⚠️ 改善が必要な項目

| 項目 | 現状 | 問題点 | 改善案 |
|------|------|--------|--------|
| **エラーハンドリング** | ❌ | `http.Error` で単純なメッセージのみ | 構造化エラーレスポンス |
| **パスワード保安** | ❌ | 平文保存 | `bcrypt` でハッシュ化 |
| **認証方式** | ❌ | なし（フロントで user_id 管理？） | JWT トークン導入 |
| **ロギング** | ⚠️ | `log.Println`, `fmt.Println` 混在 | `log/slog` で構造化ロギング |
| **入力バリデーション** | ❌ | メールフォーマットなど未チェック | Validator ライブラリ |
| **データベースコネクション** | ❌ | 接続プール設定がない | GORM の `ConnMaxLifetime` 等 |
| **テスト** | ❌ | テストコードなし | ユニット/統合テスト導入 |
| **API ドキュメント** | ❌ | Swagger/OpenAPI なし | OpenAPI 生成 |

---

### 🎨 フロントエンド（Next.js）

#### ✅ 実装されている良いプラクティス

| 項目 | 現状 | 説明 |
|------|------|------|
| TypeScript | ✅ | 型安全性確保 |
| App Router | ✅ | モダンな Next.js（Pages Router ではない） |
| ファイルシステムルーティング | ✅ | 複雑なルーター設定不要 |
| Tailwind CSS | ✅ | ユーティリティベースで一貫性 |
| コンポーネント分割 | ✅ | Header, util など分離 |

#### ⚠️ 改善が必要な項目

| 項目 | 現状 | 問題点 | 改善案 |
|------|------|--------|--------|
| **状態管理** | ⚠️ | `useState` のみ（Props drilling 可能性） | Context API または Zustand |
| **API 呼び出し** | ⚠️ | `fetch` を直書き（重複コード） | API client 層の抽象化 |
| **エラーハンドリング** | ⚠️ | `console.error` のみ | ユーザー向けエラー表示 |
| **ローディング状態** | ⚠️ | 実装不十分 | Suspense / Loading skeleton |
| **環境変数** | ❌ | `localhost:8080` がハードコード | `.env.local` で管理 |
| **フォーム検証** | ❌ | クライアント側未実装 | react-hook-form などの導入 |
| **レスポンス型定義** | ⚠️ | 一部型不足 | 完全な型安全性確保 |
| **SEO** | ❌ | メタタグ不足 | Next.js Metadata API 活用 |
| **テスト** | ❌ | テストコードなし | Vitest / Testing Library |

---

## 改善提案

### 🔐 セキュリティ改善（優先度 🔴 高）

#### 1. パスワードハッシュ化

**現在** (❌ 危険):
```go
if user.Password != input.Password {  // 平文比較
    http.Error(w, "Invalid password", http.StatusUnauthorized)
}
```

**改善案** (✅):
```go
import "golang.org/x/crypto/bcrypt"

// ユーザー登録時
hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), 10)
user.Password = string(hashedPassword)

// ログイン時
err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(inputPassword))
if err != nil {
    http.Error(w, "Invalid password", http.StatusUnauthorized)
}
```

#### 2. JWT 認証導入

**現在**: フロントで `user_id` を管理（セッション機構なし）

**改善案**:
```go
import "github.com/golang-jwt/jwt"

func Login(w http.ResponseWriter, r *http.Request) {
    // ... パスワード検証 ...
    
    // JWT トークン生成
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": user.ID,
        "email": user.Email,
        "exp": time.Now().Add(time.Hour * 24).Unix(),  // 24時間有効
    })
    
    tokenString, _ := token.SignedString([]byte("SECRET_KEY"))
    json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}

// ミドルウェア: 全API呼び出しで トークンをチェック
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        token := r.Header.Get("Authorization")  // "Bearer <token>"
        // ... トークン検証 ...
        next(w, r)
    }
}
```

#### 3. SQL インジェクション対策（既にORM使用で対応）

現在 GORM を使っているので OK ✅

```go
// ✅ 安全
database.DB.Where("problem_id = ?", problemID).Find(&votes)

// ❌ 危険（していない）
database.DB.Where(fmt.Sprintf("problem_id = %d", problemID)).Find(&votes)
```

---

### 🛠️ アーキテクチャ改善

#### 1. エラーハンドリング統一

**現在** (不統一):
```go
http.Error(w, "User not found", http.StatusUnauthorized)       // 文字列
json.NewEncoder(w).Encode(user)                                // JSON
```

**改善案**:
```go
// 1. エラーレスポンス型を定義
type ErrorResponse struct {
    Error   bool   `json:"error"`
    Message string `json:"message"`
    Code    string `json:"code"`
}

// 2. ヘルパー関数
func respondError(w http.ResponseWriter, code int, message, errorCode string) {
    w.WriteHeader(code)
    json.NewEncoder(w).Encode(ErrorResponse{
        Error:   true,
        Message: message,
        Code:    errorCode,
    })
}

// 3. 使用
respondError(w, http.StatusUnauthorized, "User not found", "USER_NOT_FOUND")
```

#### 2. ルーティング改善（Chi フレームワークの導入）

**現在** (原始的):
```go
http.HandleFunc("/problems/", func(w http.ResponseWriter, r *http.Request) {
    idStr := strings.TrimPrefix(r.URL.Path, "/problems/")  // 手動解析
    // ...
})
```

**改善案** (Chi フレームワーク):
```go
import "github.com/go-chi/chi"

router := chi.NewRouter()
router.Get("/problems/{id}", controllers.GetProblemByID)
router.Post("/problems", controllers.CreateProblem)
router.Delete("/problems/{id}", controllers.DeleteProblem)

// コントローラー内で:
id := chi.URLParam(r, "id")  // 自動抽出！
```

#### 3. 入力バリデーション

```go
import "github.com/go-playground/validator/v10"

type UserRequest struct {
    Email    string `validate:"required,email"`
    Password string `validate:"required,min=8"`
    Name     string `validate:"required,max=100"`
}

validate := validator.New()
if err := validate.Struct(req); err != nil {
    respondError(w, 400, err.Error(), "VALIDATION_ERROR")
}
```

---

### 📊 フロントエンド改善

#### 1. API クライアント層の抽象化

**現在** (重複):
```tsx
// 投票ページ
const res = await fetch('http://localhost:8080/votes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
});

// 問題ページ
const res = await fetch('http://localhost:8080/problems', {
    method: 'GET',
});
```

**改善案** (`lib/api.ts`):
```typescript
// API クライアントを一元化
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = {
    // 認証
    signup: (email: string, password: string) =>
        fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        }).then(r => r.json()),
    
    // 問題
    getProblems: () =>
        fetch(`${API_BASE_URL}/problems`).then(r => r.json()),
    
    getProblem: (id: string) =>
        fetch(`${API_BASE_URL}/problems/${id}`).then(r => r.json()),
    
    // 投票
    castVote: (problemId: string, userId: string, point: number) =>
        fetch(`${API_BASE_URL}/votes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ problem_id: problemId, user_id: userId, point }),
        }).then(r => r.json()),
};

// 使用
const { data } = await apiClient.getProblems();
```

#### 2. 状態管理改善（Context + useReducer or Zustand）

```typescript
// context/AuthContext.tsx
import { createContext, useState } from 'react';

type User = { id: string; email: string; role: string };

export const AuthContext = createContext<{
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}>({
    user: null,
    login: async () => {},
    logout: () => {},
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState<User | null>(null);
    
    const login = async (email: string, password: string) => {
        const res = await apiClient.login(email, password);
        setUser(res.user);
        localStorage.setItem('token', res.token);
    };
    
    return (
        <AuthContext.Provider value={{ user, login, logout: ... }}>
            {children}
        </AuthContext.Provider>
    );
}

// 使用
export function useAuth() {
    return useContext(AuthContext);
}

// コンポーネント内
const { user } = useAuth();
```

#### 3. 環境変数管理

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

```typescript
// api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;
```

#### 4. フォーム検証（react-hook-form + zod）

```typescript
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const signupSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Min 8 characters'),
});

type SignupForm = z.infer<typeof signupSchema>;

export function SignupForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
        resolver: zodResolver(signupSchema),
    });
    
    return (
        <form onSubmit={handleSubmit(async (data) => {
            await apiClient.signup(data.email, data.password);
        })}>
            <input {...register('email')} placeholder="Email" />
            {errors.email && <p>{errors.email.message}</p>}
            
            <input {...register('password')} type="password" />
            {errors.password && <p>{errors.password.message}</p>}
            
            <button type="submit">Sign Up</button>
        </form>
    );
}
```

---

### 🧪 テスト導入

#### Go バックエンド（ユニットテスト）

```go
// controllers/vote_controller_test.go
package controllers

import (
    "testing"
    "math"
)

func TestGetProblemResult(t *testing.T) {
    // 1. テストデータ準備
    votes := []models.Vote{
        {Point: 70},
        {Point: 80},
        {Point: 90},
    }
    
    // 2. 関数実行
    result := calculateStats(votes, 85)
    
    // 3. 期待値と比較
    if result.Average != 80 {
        t.Errorf("expected 80, got %v", result.Average)
    }
}
```

#### Next.js フロントエンド（Vitest + Testing Library）

```typescript
// components/__tests__/VoteButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { VoteButton } from '../VoteButton';
import { describe, it, expect, vi } from 'vitest';

describe('VoteButton', () => {
    it('calls onVote when clicked', async () => {
        const mockVote = vi.fn();
        render(<VoteButton onVote={mockVote} />);
        
        const button = screen.getByText('Vote');
        fireEvent.click(button);
        
        expect(mockVote).toHaveBeenCalled();
    });
});
```

---

### 📚 ドキュメント改善

#### 1. API ドキュメント（OpenAPI/Swagger）

```yaml
# api.yaml
openapi: 3.0.0
info:
  title: Mahjong Evaluator API
  version: 1.0.0

paths:
  /signup:
    post:
      summary: Register a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SignupRequest'
      responses:
        '200':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Validation error

components:
  schemas:
    SignupRequest:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
```

#### 2. README.md の拡充

```markdown
## API Documentation
See [API.md](./API.md) or visit [Swagger UI](http://localhost:8080/swagger/index.html)

## Development Setup
1. Clone repo
2. `cp .env.example .env` and configure
3. `docker-compose up`
4. `go run main.go` (backend)
5. `npm install && npm run dev` (frontend)

## Testing
- Backend: `go test ./...`
- Frontend: `npm run test`
```

---

## 📋 コードレビューチェックリスト（実務用）

このチェックリストを使うことで、プロとしてのコードレビューができます。

### バックエンド（Go）

- [ ] **セキュリティ**
  - [ ] パスワードはハッシュ化されているか
  - [ ] SQL インジェクション対策は十分か（プリペアドステートメント使用？）
  - [ ] CORS は適切に制限されているか（`*` ではなく具体的なオリジン？）
  - [ ] 環境変数に機密情報を保存しているか（コードに直書きされていない）

- [ ] **API 設計**
  - [ ] HTTP メソッドは正しく使われているか（POST=作成, GET=取得, DELETE=削除）
  - [ ] エラーレスポンスは統一されているか
  - [ ] ステータスコードは適切か（201=作成, 400=不正, 401=認証失敗, 404=未検出, 500=サーバーエラー）
  - [ ] ページネーション対応があるか（大量データの場合）

- [ ] **コード品質**
  - [ ] エラーハンドリングは適切か（`err != nil` をチェック）
  - [ ] 入力バリデーションは十分か
  - [ ] ハードコードされた値がないか（定数化）
  - [ ] ログはデバッグ情報十分か

### フロントエンド（Next.js/React）

- [ ] **パフォーマンス**
  - [ ] 不要な再レンダリングがないか（`useMemo`, `useCallback` 適切利用）
  - [ ] API 呼び出しは最小限か（重複なし）
  - [ ] 画像は最適化されているか（Next.js Image）

- [ ] **ユーザー体験**
  - [ ] ローディング状態は表示されているか
  - [ ] エラー時のメッセージはユーザー向けか
  - [ ] フォーム検証はクライアント側に実装されているか
  - [ ] アクセシビリティ（a11y）は考慮されているか（alt テキストなど）

- [ ] **コード品質**
  - [ ] 型定義は完全か（`any` がないか）
  - [ ] 環境変数は`.env.local`で管理されているか
  - [ ] API 呼び出しは抽象化されているか（コード重複がない）
  - [ ] コンポーネント分割は適切か

---

## 📚 学習リソース

### セキュリティ
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Go Security Best Practices](https://golang.org/doc/effective_go)

### API 設計
- [RESTful Web Services](https://www.oreilly.com/library/view/restful-web-services/9780596529260/) (Leonard Richardson)
- [API Design Best Practices](https://swagger.io/resources/articles/best-practices-in-api-design/)

### Go
- [Go Web Development](https://golang.org/doc/articles/wiki/)
- [GORM Guides](https://gorm.io/docs)

### Next.js/React
- [Next.js Official Docs](https://nextjs.org/docs)
- [React Best Practices](https://react.dev/learn)

### テスト
- [Go Testing](https://golang.org/pkg/testing/)
- [Testing Library React](https://testing-library.com/react)

---

## 🎯 次のステップ（優先順）

1. **セキュリティ強化** (1-2週間)
   - パスワードハッシュ化（bcrypt）
   - JWT 認証導入

2. **エラーハンドリング統一** (3-5日)
   - 構造化エラーレスポンス
   - 統一ロギング

3. **ルーティング改善** (1週間)
   - Chi フレームワーク導入
   - ミドルウェアの実装

4. **フロントエンド API 層** (1週間)
   - API クライアント抽象化
   - 環境変数管理

5. **テスト導入** (2-3週間)
   - ユニットテスト
   - 統合テスト

6. **ドキュメント** (1週間)
   - OpenAPI/Swagger
   - README 拡充

---

**まとめ**: このアプリは基本的によく設計されていますが、本番環境を想定するとセキュリティと認証周りの強化が急務です。段階的に改善していきましょう！

