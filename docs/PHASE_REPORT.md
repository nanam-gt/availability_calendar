# Phase Report

## Phase 1

- 実装内容: Cloudflare Workers + D1 用のプロジェクト骨格、公開トップ、静的アセット配信、migration、README を追加。
- 変更ファイル: `package.json`, `wrangler.jsonc`, `src/index.ts`, `public/*`, `migrations/0001_create_availability.sql`, `README.md` ほか仕様書。
- 確認方法: `npm install` 後、`npm run dev` で `/` を表示。

## Phase 2

- 実装内容: 日本語曜日の1か月カレンダー、前月・翌月移動、現在月より前と3か月先超過の移動制限、スマホ7列表示を実装。
- 変更ファイル: `public/js/calendar-core.js`, `public/js/public-calendar.js`, `public/css/app.css`, `public/index.html`。
- 確認方法: `/` で月送りボタン、375px幅、月初位置、月末表示を確認。

## Phase 3

- 実装内容: D1 binding、`availability` migration、公開API `GET /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD` を実装。
- 変更ファイル: `wrangler.jsonc`, `migrations/0001_create_availability.sql`, `src/index.ts`。
- 確認方法: D1 migration 後、日付範囲付きで `/api/availability` を呼び出し、JSON が返ることを確認。

## Phase 4

- 実装内容: 公開画面に `○ 空き`、`△ キャンセル待ち`、`× 予約不可` を記号とテキストで表示。未設定日は日付のみ、過去日は薄く表示してステータス非表示。
- 変更ファイル: `public/js/calendar-core.js`, `public/js/public-calendar.js`, `public/css/app.css`。
- 確認方法: API から各 status を返し、公開カレンダー上の表示と過去日の非表示を確認。

## Phase 5

- 実装内容: `/admin`、共通パスワードログイン、署名付き HttpOnly/Secure/SameSite Cookie セッション、ログアウト、管理APIの認証チェックを実装。
- 変更ファイル: `src/index.ts`, `public/admin.html`, `public/js/admin-calendar.js`。
- 確認方法: `/admin` で正しいパスワードと誤ったパスワード、ログアウト、未認証時の管理API 401 を確認。
