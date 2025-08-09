import { z } from 'zod';
import { SlackAuthenticator } from '../../shared/auth.js';
import { handleSlackError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const FilesReadSchema = z.object({
  channel: z.string().optional().describe('特定のチャンネルのファイルを取得'),
  count: z.number().min(1).max(1000).default(100).optional().describe('取得件数 (1-1000)'),
  page: z.number().min(1).default(1).optional().describe('ページ番号'),
  ts_from: z.string().optional().describe('指定したタイムスタンプ以降のファイルを取得'),
  ts_to: z.string().optional().describe('指定したタイムスタンプ以前のファイルを取得'),
  types: z.string().optional().describe('ファイルタイプでフィルタ (カンマ区切り: images,gdocs,zips,pdfs等)'),
  user: z.string().optional().describe('指定したユーザーが作成したファイルのみ取得'),
});

export type FilesReadInput = z.infer<typeof FilesReadSchema>;

/**
 * ワークスペースのファイル一覧を取得します。
 * Slack APIの `files.list` メソッドに対応します。
 */
export const filesReadDescription = 'ワークスペースのファイル一覧を取得します。';

/**
 * @param env {ToolEnv} SLACK_USER_TOKENを含む環境変数
 * @param input {FilesReadInput} ツールへの入力
 * @returns {Promise<object>} ファイル一覧とページネーション情報
 */
export async function filesRead(env: ToolEnv, input: FilesReadInput): Promise<object> {
  // 1. 入力検証
  const validatedInput = FilesReadSchema.parse(input);

  // 2. Slack API呼び出し
  const auth = new SlackAuthenticator(env.SLACK_USER_TOKEN);
  const slack = auth.getWebClient();

  const result = await slack.files.list({
    channel: validatedInput.channel,
    count: validatedInput.count,
    page: validatedInput.page,
    ts_from: validatedInput.ts_from,
    ts_to: validatedInput.ts_to,
    types: validatedInput.types,
    user: validatedInput.user,
  });

  if (!result.ok) {
    handleSlackError(result);
  }

  // 3. レスポンス整形
  return {
    files: result.files || [],
    paging: result.paging,
  };
}