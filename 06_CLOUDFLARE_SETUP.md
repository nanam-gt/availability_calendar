# Cloudflare セットアップ方針

## 使用サービス
- Cloudflare Workers
- Cloudflare D1

## Codexが用意するもの
- wrangler設定
- D1 binding
- migration
- Secret設定手順
- deploy手順

## Secrets
- ADMIN_PASSWORD
- SESSION_SECRET

実値はGitHubへ保存しない。

## 環境変数
- RESERVATION_URL
- MAX_FUTURE_MONTHS

初期値：
`MAX_FUTURE_MONTHS = 3`

## ローカル開発
READMEに実際の構成に応じたコマンドを書く。

例：
```bash
npm install
npm run dev
```

## デプロイ
例：
```bash
npx wrangler deploy
```

## 公開URL
初期は `workers.dev` URLでよい。

## GitHub
Secrets、ローカル環境変数、一時ファイルをコミットしない。
