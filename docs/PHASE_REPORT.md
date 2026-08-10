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

## Phase 6

- 実装内容: 管理画面で日付を1つ選択し、`available`、`waiting`、`unavailable`、未設定戻しを保存できるように実装。
- 変更ファイル: `src/index.ts`, `public/admin.html`, `public/js/admin-calendar.js`。
- 確認方法: `/admin` で1日だけ選択して各ステータス保存、公開画面への反映、未設定戻しを確認。

## Phase 7

- 実装内容: 管理画面で複数日をタップ選択・解除し、一括でステータス更新または未設定戻しできるように実装。
- 変更ファイル: `src/index.ts`, `public/admin.html`, `public/js/admin-calendar.js`, `public/css/app.css`。
- 確認方法: スマホ幅で複数日を選択し、一括保存後に公開画面とAPIレスポンスを確認。

## Phase 8

- 実装内容: 公開画面下部に `宿泊予約を申し込む` の通常リンクを配置し、`RESERVATION_URL` からリンク先を変更できるように実装。Google API や認証連携は未使用。
- 変更ファイル: `src/index.ts`, `public/index.html`, `public/js/public-calendar.js`, `wrangler.jsonc`。
- 確認方法: `/api/config` の `reservationUrl` と公開画面ボタンのリンク先を確認。

## Phase 9

- 実装内容: 自然、里山、温かみ、落ち着き、余白を意識した配色とレイアウトに調整。スマホ優先で横スクロールなし、管理画面も同じ世界観で統一。
- 変更ファイル: `public/css/app.css`, `public/index.html`, `public/admin.html`。
- 確認方法: 375px、390px、768px、1024px以上で文字の収まり、カレンダー7列、ボタン配置を確認。

## Phase 10

- 実装内容: TypeScript 設定を追加し、存在しない Cloudflare Workers 型定義バージョンを修正。JS 構文チェックと TypeScript チェックを実行。
- 変更ファイル: `package.json`, `package-lock.json`, `tsconfig.json`。
- 確認方法: `node --check public/js/*.js` と `npm run check` が成功することを確認。

## Phase 11

- 実装内容: README に GitHub URL と検証コマンドを追記し、セットアップ、Secrets、D1 migration、ローカル開発、デプロイ、運用手順を整理。
- 変更ファイル: `README.md`, `docs/PHASE_REPORT.md`。
- 確認方法: README の手順に沿って `npm install`、migration、`npm run dev`、`npm run check` を実行。
