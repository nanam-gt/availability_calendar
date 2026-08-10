# セキュリティ仕様

## 管理パスワード
ソースコードへ直接記述しない。
Cloudflare Secret：
`ADMIN_PASSWORD`

## セッション
`SESSION_SECRET`

Cookie：
- HttpOnly
- Secure
- SameSite=Lax または Strict
- 有効期限あり

パスワード自体をCookieへ保存しない。

## HTTPS
Cloudflare上でHTTPSのみ。

## 管理API
すべて認証必須。

## SQL
プリペアドステートメントを使用。

## ログ
以下を出さない：
- ADMIN_PASSWORD
- SESSION_SECRET
- Cookie内容
- 認証情報

## robots
管理画面はクロール対象外。ただしURL秘匿を認証代わりにしない。

## Googleフォーム
Google OAuth等は使わない。単純な外部リンクのみ。
