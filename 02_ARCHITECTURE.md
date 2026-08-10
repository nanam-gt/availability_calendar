# システム構成・技術設計

## 全体構成
```text
公式HP
  ↓
「空き状況を見る」
  ↓
Cloudflare Workers
  ├─ 公開画面 /
  ├─ 管理画面 /admin
  ├─ 公開API /api/availability
  ├─ 管理API /api/admin/*
  └─ Cloudflare D1
```

## 役割
### 公式HP
空き状況アプリへのリンクのみ。

### Webアプリ
カレンダー表示、管理画面、ステータス更新、Googleフォームへのリンク。

### Excel
正式な予約管理。本アプリとは連携しない。

### Googleフォーム
予約申し込み受付。API連携なし。通常のURLリンクのみ。

## 推奨構成
```text
src/
  index.ts
  routes/
  auth/
  db/
public/
  index.html
  admin.html
  css/
  js/
migrations/
wrangler.jsonc
package.json
README.md
```

## 依存サービス
必須：
- Cloudflare Workers
- Cloudflare D1

不要：
- Firebase
- Supabase
- Google Sheets API
- Google Forms API
- Microsoft Graph API
- OneDrive API
- 外部認証サービス

## 将来の置き換え
サイトコントローラー導入後は、公式HPのリンク先変更だけで廃止可能にする。
