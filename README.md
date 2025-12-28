# GitHub to GitLab 自動バックアップ

## 概要

- Node.js v24 以降
- [GitHub REST API v3](https://developer.github.com/v3/)
- GitLab CE

## 使用方法

### インストール

`npm install` を実行してください。

```bash
npm install
```

### 環境変数の設定

```bash
cp .env.example .env
vi .env
```

.env ファイルに必要な変数を設定してください。システムの環境変数として直接設定することもできます。

**必須の環境変数:**
- `GITLAB_API_URL`: GitLab API のエンドポイント URL
- `GITLAB_NAMESPACE`: GitLab のターゲットネームスペース
- `GITLAB_TOKEN`: GitLab 個人アクセストークン（セキュリティのためシステム環境変数として設定可能）
- `GITHUB_API_URL`: GitHub API のエンドポイント URL
- `GITHUB_TYPE`: `orgs` または `users` のいずれか
- `GITHUB_OWNER`: GitHub の組織名またはユーザー名
- `GITHUB_TOKEN`: GitHub 個人アクセストークン（セキュリティのためシステム環境変数として設定可能）

**注意:** シークレットトークン（`GITLAB_TOKEN` と `GITHUB_TOKEN`）は、セキュリティ向上のため .env ファイルではなくシステム環境変数として提供することができます。

### バックアップの開始

```bash
npm start
```

以下のコマンドと同じです。

```bash
node index.js
```

#### clean モード

`--clean` モードは GitHub リポジトリの以前の状態を無視します。

```bash
node index.js --clean
```

#### force モード

`--force` モードは以前のタイムスタンプを無視し、すべてのリポジトリを強制的にバックアップします。

```bash
node index.js --force
```

#### dry モード

`--dry` モードはすべての対象リポジトリをチェックしますが、プロジェクトの削除やリポジトリのインポートは行いません。

```bash
node index.js --dry
```

## ライセンス

Copyright (c) 2019 MESN Inc.

[MIT license](https://opensource.org/licenses/mit-license.php) の下でリリースされています。

