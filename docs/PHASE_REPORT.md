# Phase Report

## Phase 1

- 実装内容: Cloudflare Workers + D1 用のプロジェクト骨格、公開トップ、静的アセット配信、migration、README を追加。
- 変更ファイル: `package.json`, `wrangler.jsonc`, `src/index.ts`, `public/*`, `migrations/0001_create_availability.sql`, `README.md` ほか仕様書。
- 確認方法: `npm install` 後、`npm run dev` で `/` を表示。

## Phase 2

- 実装内容: 日本語曜日の1か月カレンダー、前月・翌月移動、現在月より前と3か月先超過の移動制限、スマホ7列表示を実装。
- 変更ファイル: `public/js/calendar-core.js`, `public/js/public-calendar.js`, `public/css/app.css`, `public/index.html`。
- 確認方法: `/` で月送りボタン、375px幅、月初位置、月末表示を確認。
