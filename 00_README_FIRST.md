# Codex 開発開始ガイド

## このフォルダについて
いちばん星ビレッジの「宿泊空き状況カレンダー Webアプリ」を VS Code + Codex で開発するための指示書一式です。

Codexは最初にこのファイルと `01_PRODUCT_SPEC.md` を読んでください。

## 開発目的
公式HPの「空き状況を見る」ボタンから遷移する、宿泊施設の空き状況確認用Webアプリを作成します。

このアプリは予約システムではありません。正式な予約管理はExcelで行い、Webアプリにはスタッフが手動で公開用ステータスを設定します。

表示ステータス：
- ○ 空き
- △ キャンセル待ち
- × 予約不可

空き状況はリアルタイムではなく、予約申し込み後にスタッフが最新状況を確認します。

## 最重要方針
1. シンプルに作る
2. スマートフォン優先
3. Cloudflareで低コスト運用
4. Excelとは連携しない
5. 個人情報を保存しない
6. GoogleフォームとはAPI連携せずリンクのみ
7. 将来サイトコントローラーへ移行しやすくする
8. 不要な機能を勝手に追加しない

## 読む順番
1. `00_README_FIRST.md`
2. `01_PRODUCT_SPEC.md`
3. `02_ARCHITECTURE.md`
4. `03_UI_UX.md`
5. `04_DATA_AND_API.md`
6. `05_SECURITY.md`
7. `06_CLOUDFLARE_SETUP.md`
8. `07_IMPLEMENTATION_PLAN.md`
9. `08_TEST_CHECKLIST.md`
10. `09_OPERATIONS.md`

## 推奨技術
- Cloudflare Workers
- Cloudflare D1
- TypeScript
- HTML / CSS / JavaScript または軽量なフロントエンド
- Git / GitHub

React等を使う場合も、アプリ規模に対して過剰にならない構成にしてください。
