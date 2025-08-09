# MCP Slack Claude Extension

Claude DesktopでSlackワークスペースの情報を取得・分析するためのMCP（Model Context Protocol）拡張機能です。チャンネルの会話履歴、ユーザー情報、ファイル、検索結果などを取得し、レポーティングやTODO管理に活用できます。

## 🚀 機能

この拡張機能は、Slack APIを通じて以下の情報を取得できる16のツールを提供します：

### 📋 チャンネル・ユーザー管理
- **channels_read**: ワークスペースのチャンネル一覧を取得
- **users_read**: ワークスペースのユーザー一覧を取得
- **usergroups_read**: ワークスペースのユーザーグループ一覧を取得

### 💬 メッセージ履歴取得
- **channels_history**: パブリックチャンネルのメッセージ履歴を取得
- **groups_history**: プライベートチャンネルのメッセージ履歴を取得
- **im_history**: ダイレクトメッセージの履歴を取得
- **mpim_history**: マルチパーティーダイレクトメッセージの履歴を取得

### 🔍 検索機能
- **search_read**: 汎用メッセージ検索（全チャンネル対象）
- **search_read_files**: ファイル検索
- **search_read_im**: ダイレクトメッセージ検索
- **search_read_mpim**: マルチパーティーDM検索
- **search_read_private**: プライベートチャンネル検索
- **search_read_public**: パブリックチャンネル検索

### 📁 ファイル・その他
- **files_read**: ワークスペースのファイル一覧を取得
- **bookmarks_read**: チャンネルのブックマーク一覧を取得
- **links_read**: チャンネルの共有リンク一覧を取得

## 📋 前提条件

- **Node.js** 18以上
- **Claude Desktop** アプリケーション
- **Slack User OAuth Token** (`xoxp-`で始まるトークン)

## 🛠️ インストール

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/mcp-slack-claude-extension.git
cd mcp-slack-claude-extension
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. ビルド

```bash
npm run build
```

### 4. DXTパッケージの作成

```bash
npm run pack
```

これにより、`dist/`ディレクトリに`.dxt`ファイルが生成されます。

## ⚙️ 設定

### Slack OAuth Tokenの取得

1. [Slack API](https://api.slack.com/apps)にアクセス
2. 「Create New App」をクリック
3. 「From scratch」を選択
4. アプリ名とワークスペースを設定
5. 「OAuth & Permissions」セクションで以下のスコープを追加：

#### User Token Scopes
```
channels:history
channels:read
files:read
groups:history
groups:read
im:history
im:read
mpim:history
mpim:read
search:read
users:read
usergroups:read
bookmarks:read
links:read
```

6. 「Install to Workspace」をクリック
7. 生成された「User OAuth Token」（`xoxp-`で始まる）をコピー

### Claude Desktopでの設定

1. Claude Desktopを開く
2. 設定 → Extensions → Add Extension
3. 生成された`.dxt`ファイルを選択
4. 「Slack User OAuth Token」フィールドに取得したトークンを入力
5. 拡張機能を有効化

## 💡 使用例

### チャンネル一覧の取得
```
channels_readツールを使用して、ワークスペースのチャンネル一覧を取得してください。
```

### 特定チャンネルの履歴取得
```
channels_historyツールを使用して、チャンネルID "C1234567890" の過去100件のメッセージを取得してください。
```

### メッセージ検索
```
search_readツールを使用して、「プロジェクト」というキーワードで過去1週間のメッセージを検索してください。
```

### ファイル検索
```
files_readツールを使用して、PDFファイルのみを過去30日間から取得してください。
```

## 🔧 トラブルシューティング

### よくある問題

#### 1. 「Server error: SLACK_USER_OAUTH_TOKEN is not set」
- Slack OAuth Tokenが正しく設定されていません
- Claude Desktopの拡張機能設定でトークンを再入力してください

#### 2. 「missing_scope」エラー
- 必要なOAuthスコープが不足しています
- Slack APIアプリの設定で必要なスコープを追加してください

#### 3. 「channel_not_found」エラー
- 指定したチャンネルIDが存在しないか、アクセス権限がありません
- チャンネルIDを確認するか、channels_readツールでチャンネル一覧を取得してください

#### 4. 拡張機能が起動しない
- Node.jsのバージョンを確認してください（18以上が必要）
- `npm run build`でビルドエラーがないか確認してください

### ログの確認

Claude Desktopのログは以下の場所で確認できます：
- macOS: `~/Library/Logs/Claude/mcp-server-Slack History Extension.log`
- Windows: `%APPDATA%\Claude\logs\mcp-server-Slack History Extension.log`

## 🔗 関連リンク

- [Claude Desktop](https://claude.ai)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Slack API Documentation](https://api.slack.com/)
- [DXT Extension Format](https://github.com/anthropics/dxt)
- [Claude Desktop Extension Guide](https://www.anthropic.com/help/getting-started-with-local-mcp-servers-on-claude-desktop)
