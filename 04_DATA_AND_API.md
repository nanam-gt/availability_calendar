# データベース・API仕様

## D1テーブル
```sql
CREATE TABLE availability (
  date TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## status
許可値：
- available
- waiting
- unavailable

## 未設定
未設定日はレコード削除方式を推奨。

## 日付
`YYYY-MM-DD`
日本時間基準。

## 公開API
`GET /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD`

レスポンス例：
```json
{
  "availability": [
    {"date":"2026-08-15","status":"available"},
    {"date":"2026-08-16","status":"unavailable"}
  ]
}
```

## ログイン
`POST /api/admin/login`

## ログアウト
`POST /api/admin/logout`

## 更新
`PUT /api/admin/availability`

例：
```json
{
  "dates": ["2026-08-15","2026-08-16"],
  "status": "unavailable"
}
```

## 未設定へ戻す
`DELETE /api/admin/availability`

## サーバー側検証
- YYYY-MM-DD形式
- 実在日
- status許可値
- 管理API認証
- 異常な大量リクエスト拒否
