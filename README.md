# Tourhub — Gold Coast Ops

ゴールドコーストのツアー会社向け業務管理システム。Claude Design のプロトタイプをベースに、実際に動く Next.js アプリとして実装したものです。

## 機能

- **ダッシュボード** — 悪天候警報バナー、KPI、海況ライブパネル、本日のタイムライン、要対応アラート、売上・チャネルサマリー
- **予約・カレンダー** — 在庫カレンダー / 空き枠一元管理 / 事前案内オートメーション
- **アサイン・シフト** — ガイド・車両のドラッグ&ドロップ割当、定員/未割当の自動警告
- **機材・アセット** — 在庫とステータス管理、不足品目の警告
- **送迎・ルート** — ピックアップリストと最短巡回ルート
- **お客様・代理店** — 顧客CRM / 代理店精算
- **参加者名簿** — QR点呼チェックイン、安全SOPロック、リアルタイム統計
- **オペレーションチャット**（現場 ⇄ 本部）

## 技術スタック

- Next.js 14 (App Router) + TypeScript
- React 18
- 元デザインの inline style は `lib/sx.ts`（CSS文字列→Reactスタイル変換）で忠実移植

## 構成

```
app/        layout / page（状態管理・画面切替）/ globals.css
lib/        sx（スタイル変換）/ theme / data / modules-static
components/ Sidebar / Topbar / Dashboard / FloatingChat ほか
            modules/ AssignModule / CrmModule / ManifestModule（インタラクティブ）
```

データは `lib/` に集約。将来 OpenWeather や予約DB へ繋ぐ際は data 層を実APIへ差し替えます。

## 開発

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
```
