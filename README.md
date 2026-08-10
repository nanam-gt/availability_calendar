# いちばん星ビレッジ 宿泊空き状況カレンダー

Cloudflare Workers + D1 で動作する、宿泊空き状況の公開カレンダーです。予約システムではなく、正式な予約管理は Excel で行います。個人情報は保存しません。

GitHub: https://github.com/nanam-gt/availability_calendar

Production: https://ichibanboshi-availability-calendar.ichibanboshi.workers.dev

## 構成

```text
src/index.ts              Workers API / 認証 / D1操作
public/index.html         公開画面
public/admin.html         管理画面
public/css/app.css        共通スタイル
public/js/*.js            カレンダーUI
migrations/               D1 migration
wrangler.jsonc            Cloudflare Workers設定
```

## セットアップ

```bash
npm install
npx wrangler d1 create ichibanboshi_availability
```

作成された `database_id` を `wrangler.jsonc` の `database_id` に設定してください。

## Secrets

実値はリポジトリに保存しません。

```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
```

ローカル開発では `.dev.vars` を作成できます。

```text
ADMIN_PASSWORD=local-password
SESSION_SECRET=local-session-secret
```

## 環境変数

`wrangler.jsonc` の `vars` で変更できます。

- `RESERVATION_URL`: 宿泊予約を申し込むボタンのリンク先
- `MAX_FUTURE_MONTHS`: 現在月から何か月先まで表示するか。初期値は `3`

## D1 migration

```bash
npm run db:migrate:local
npm run db:migrate:remote
```

## ローカル開発

```bash
npm run dev
```

- 公開画面: `/`
- 管理画面: `/admin`

## デプロイ

```bash
npm run deploy
```

## 確認

```bash
npm run check
node --check public/js/calendar-core.js
node --check public/js/public-calendar.js
node --check public/js/admin-calendar.js
```

## 運用

1. Excel を正式な予約管理として更新します。
2. `/admin` にログインします。
3. 対象日をタップで選択します。
4. `○ 空き`、`△ キャンセル待ち`、`× 予約不可`、`未設定に戻す` から選び保存します。
5. 公開画面で反映を確認します。

未設定日は公開画面では日付のみ表示されます。公開画面の日付をクリックしても何も起きません。
