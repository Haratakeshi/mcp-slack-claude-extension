import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { handleSlackError } from './slack/shared/error-handler.js';
import { ToolEnv } from './slack/shared/types.js';

// すべてのツール定義をインポート
import { usersRead, UsersReadSchema, usersReadDescription } from './slack/tools/users/users-read.js';
import { usergroupsRead, UsergroupsReadSchema, usergroupsReadDescription } from './slack/tools/users/usergroups-read.js';
import { channelsRead, ChannelsReadSchema, channelsReadDescription } from './slack/tools/channels/channels-read.js';
import { channelsHistory, ChannelsHistorySchema, channelsHistoryDescription } from './slack/tools/messages/channels-history.js';
import { groupsHistory, GroupsHistorySchema, groupsHistoryDescription } from './slack/tools/messages/groups-history.js';
import { imHistory, ImHistorySchema, imHistoryDescription } from './slack/tools/messages/im-history.js';
import { mpimHistory, MpimHistorySchema, mpimHistoryDescription } from './slack/tools/messages/mpim-history.js';
import { filesRead, FilesReadSchema, filesReadDescription } from './slack/tools/files/files-read.js';
import { linksRead, LinksReadSchema, linksReadDescription } from './slack/tools/misc/links-read.js';
import { bookmarksRead, BookmarksReadSchema, bookmarksReadDescription } from './slack/tools/misc/bookmarks-read.js';
import { searchRead, SearchReadSchema, searchReadDescription } from './slack/tools/search/search-read.js';
import { searchFiles, SearchFilesSchema, searchFilesDescription } from './slack/tools/search/search-files.js';
import { searchDm, SearchDmSchema, searchDmDescription } from './slack/tools/search/search-dm.js';
import { searchMpim, SearchMpimSchema, searchMpimDescription } from './slack/tools/search/search-mpim.js';
import { searchPrivate, SearchPrivateSchema, searchPrivateDescription } from './slack/tools/search/search-private.js';
import { searchPublic, SearchPublicSchema, searchPublicDescription } from './slack/tools/search/search-public.js';

try {
  console.error('[DEBUG] Server starting up...');

  // 1. McpServerのインスタンスを作成
  console.error('[DEBUG] Creating McpServer instance...');
  const server = new McpServer({
    name: 'mcp-slack-claude-extension',
    version: '0.2.0', // 機能追加のためバージョンアップ
  });
  console.error('[DEBUG] McpServer instance created.');

  // 2. ツール定義の配列を作成
  console.error('[DEBUG] Preparing tool definitions...');
  const toolDefinitions = [
    { name: 'users_read', description: usersReadDescription, schema: UsersReadSchema, implementation: usersRead },
    { name: 'usergroups_read', description: usergroupsReadDescription, schema: UsergroupsReadSchema, implementation: usergroupsRead },
    { name: 'channels_read', description: channelsReadDescription, schema: ChannelsReadSchema, implementation: channelsRead },
    { name: 'channels_history', description: channelsHistoryDescription, schema: ChannelsHistorySchema, implementation: channelsHistory },
    { name: 'groups_history', description: groupsHistoryDescription, schema: GroupsHistorySchema, implementation: groupsHistory },
    { name: 'im_history', description: imHistoryDescription, schema: ImHistorySchema, implementation: imHistory },
    { name: 'mpim_history', description: mpimHistoryDescription, schema: MpimHistorySchema, implementation: mpimHistory },
    { name: 'files_read', description: filesReadDescription, schema: FilesReadSchema, implementation: filesRead },
    { name: 'links_read', description: linksReadDescription, schema: LinksReadSchema, implementation: linksRead },
    { name: 'bookmarks_read', description: bookmarksReadDescription, schema: BookmarksReadSchema, implementation: bookmarksRead },
    { name: 'search_read', description: searchReadDescription, schema: SearchReadSchema, implementation: searchRead },
    { name: 'search_read_files', description: searchFilesDescription, schema: SearchFilesSchema, implementation: searchFiles },
    { name: 'search_read_im', description: searchDmDescription, schema: SearchDmSchema, implementation: searchDm },
    { name: 'search_read_mpim', description: searchMpimDescription, schema: SearchMpimSchema, implementation: searchMpim },
    { name: 'search_read_private', description: searchPrivateDescription, schema: SearchPrivateSchema, implementation: searchPrivate },
    { name: 'search_read_public', description: searchPublicDescription, schema: SearchPublicSchema, implementation: searchPublic },
  ];
  console.error(`[DEBUG] ${toolDefinitions.length} tool definitions prepared.`);

  // 3. すべてのツールを動的に登録
  console.error('[DEBUG] Registering tools...');
  toolDefinitions.forEach((tool, index) => {
    console.error(`[DEBUG] Registering tool ${index + 1}/${toolDefinitions.length}: ${tool.name}`);
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: (tool.schema as any).shape, // 元の実装に戻す
      },
      async (input: any) => {
        // 環境変数をToolEnv形式に整形
        const env: ToolEnv = {
          SLACK_USER_TOKEN: process.env.SLACK_USER_OAUTH_TOKEN || '',
          SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || '', // 必要に応じてmanifest.jsonに追加
        };

        if (!env.SLACK_USER_TOKEN) {
          throw new Error('Server error: SLACK_USER_OAUTH_TOKEN is not set.');
        }

        try {
          // 各ツールの実装関数を呼び出す
          const result = await tool.implementation(env, input);
          
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          // エラーをMCPが期待する形式に整形して返す
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
          return {
            isError: true,
            content: [{
              type: 'text' as const,
              text: `Tool execution failed: ${errorMessage}`
            }]
          };
        }
      }
    );
  });
  console.error('[DEBUG] All tools registered.');


  // 4. StdioServerTransportを使用してサーバーを接続
  console.error('[DEBUG] Creating StdioServerTransport...');
  const transport = new StdioServerTransport();
  console.error('[DEBUG] Connecting server to transport...');
  server.connect(transport);
  console.error('[DEBUG] Server connected.');

  // 5. クリーンシャットダウン処理
  process.on('SIGINT', () => {
    console.error('Received SIGINT, shutting down...');
    process.exit(0);
  });

  console.error(`MCP Slack Extension Server is running with ${toolDefinitions.length} tools.`);

} catch (error) {
  const errorMessage = error instanceof Error ? `Message: ${error.message}\nStack: ${error.stack}` : String(error);
  console.error('!!! FATAL SERVER ERROR ON STARTUP !!!');
  console.error(JSON.stringify({
    error: errorMessage,
    details: error,
  }, null, 2));
  // エラーでプロセスを終了させて、DXT側で再起動がかかるようにする
  process.exit(1);
}