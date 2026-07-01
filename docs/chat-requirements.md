# オペレーションチャット 要件定義（v2）

最終更新: 2026-07-01 ／ マルチテナント基盤(0003_tenancy)反映

## 0. 前提の変化（v1→v2）
並行開発で **マルチテナント基盤** が導入された（`organizations` / `profiles` / `invitations`、
org単位RLS、招待制サインアップ、メンバー権限管理）。これによりチャット要件の前提が更新される。
- スタッフは **招待コード制で実ユーザー化**（`profiles.role = owner|staff`、`perms` jsonb）。
- データ分離は **組織(org)単位**。チャットも `org_id` ＋ `auth_org_id()` でorg内共有が基本。

## 1. 目的・スコープ
- 同一組織内の本部・現場スタッフ間の運行連絡を、便ごと／個別／一斉で行う。
- **社内（同一org）専用**。代理店/OTA・顧客など外部は対象外。

## 2. チャットの単位（3種のみ）
| 種別 | 説明 | メンバー | 期間 |
|---|---|---|---|
| **便グループ** | ツアー便ごとの連絡集約 | 本部＋その便の担当ガイド/ドライバー（自動） | **当日でアーカイブ** |
| **1:1 DM** | 本部⇄スタッフの個別連絡 | 2者 | 常設 |
| **全体アナウンス** | 本部→全スタッフ一斉（一方向） | 送信=owner等／受信=org全員 | 常設 |

## 3. ロールの対応（新モデルへマップ）
既存は `owner/staff` ＋ `perms{booking,assign,sales,settings}`。チャット上のロールは次で表現する。
- **本部オペレーター** = `owner`、または `perms.assign`（配車・運行担当）を持つ staff。
- **現場スタッフ（ガイド/ドライバー）** = 上記以外の staff。
- 職種（ガイド/ドライバー）の区別 → **未決（§9-A）**。UI表示と将来の絞り込みに使うなら `profiles.job` を追加。

| ロール | 便グループ | 1:1 DM | アナウンス |
|---|---|---|---|
| 本部(owner / assign権限) | 全便 閲覧・投稿・作成 | 任意のスタッフへ開始可 | **送信可** |
| 現場スタッフ | 自分が担当する便のみ | 本部とのDMのみ | 受信（閲覧のみ） |

## 4. メンバー構成ルール（自動）
- 便グループのメンバーは **アサイン・シフトから自動生成**（本部＋担当ガイド/ドライバー）。
- **前提（§9-B）**: アサインが現状「氏名テキスト」なので、**担当を `profiles`(実ユーザー) から選ぶ方式へ変更**が必要。
  これが無いと user_id が取れず自動招集できない。
- アナウンスは org 全員が対象（明示メンバー行は持たない）。

## 5. 有効期間・アーカイブ
- 便グループはツアー終了後に**自動アーカイブ**（閲覧可・投稿不可）。既定表示は当日分。
- DM・アナウンスは常設。

## 6. データモデル案（Supabase・org対応）
```
chat_threads
  id uuid pk
  org_id uuid not null default auth_org_id()   -- ★org単位
  type text        -- 'tour' | 'dm' | 'broadcast'
  title text
  tour_id uuid null references tours(id)        -- 便グループ
  status text      -- 'active' | 'archived'
  archived_at timestamptz null
  created_by uuid
  created_at timestamptz

chat_members         -- tour/dm のメンバー（broadcast は行を持たない）
  thread_id uuid, user_id uuid, joined_at timestamptz
  (pk: thread_id+user_id)

chat_messages
  id uuid pk, thread_id uuid, sender_id uuid,
  body text, attachment_url text null, created_at timestamptz

chat_reads           -- 未読数
  thread_id uuid, user_id uuid, last_read_at timestamptz
  (pk: thread_id+user_id)
```
- RLS（org単位・profilesベース）:
  - `chat_threads` select: `org_id = auth_org_id()` かつ（type='broadcast' or 自分がchat_membersに存在）。
  - `chat_messages` select/insert: 対象threadのメンバーのみ。broadcastのinsertは **owner（またはassign権限）** のみ。
- リアルタイム: Supabase Realtime（`chat_messages` insert 購読）。

## 7. 主要機能（v1スコープ）
- 送受信 / 未読バッジ(`chat_reads`) / スレッド切替 / 当日アーカイブ表示。
- **v1はテキストのみ**（画像・ファイル添付は後回し。`attachment_url` はスキーマに残すが未使用）。
- 通知は**アプリ内の未読バッジのみ**（メール/プッシュは後回し）。
- 既存の現場アクション（SOS/集金リマインド）を便グループへ接続（将来）。

## 8. 前提・依存（更新）
- ~~スタッフ＝ログインユーザーの紐付け~~ → **招待制で解決済み**（`profiles`）。
- **残る前提**: アサインの担当者を `profiles` 参照に変更（§9-B）。必要なら職種フィールド追加（§9-A）。

## 9. 残論点（v2・確定）
| # | 論点 | 決定 |
|---|---|---|
| 1 | アカウント発行方法 | **招待コード制**（実装済み基盤を利用） |
| A | 職種(ガイド/ドライバー/本部)の区別 | **`profiles.job` を追加**する |
| B | アサインを profiles 参照へ | **変更する**（担当を実スタッフから選択。便グループ自動化の前提） |
| C | 画像添付 | **v1はテキストのみ**（添付は後回し） |
| D | 通知 | **v1はアプリ内未読のみ** |
| E | アナウンス既読確認 | **v1は既読数のみ**（誰が読んだかは後） |
| F | DM範囲 | **本部⇄スタッフのみ** |

> すべて確定。次は §10 の順で実装に着手する。

## 10. 推奨実装順
1. **アサインを profiles 参照化**（＋必要なら `profiles.job` 追加）… 便グループ自動化の前提
2. 便グループ生成＋メッセージ送受信（Realtime, org-RLS）
3. 1:1 DM ／ 全体アナウンス
4. 未読・画像添付・通知
