import { z } from 'zod';
import { SlackAuthenticator } from '../../shared/auth.js';
import { handleSlackError } from '../../shared/error-handler.js';
import { ChannelIdSchema } from '../../shared/validators.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const BookmarksReadSchema = z.object({
  channel_id: ChannelIdSchema.describe('ブックマークを取得するチャンネルID'),
});

export type BookmarksReadInput = z.infer<typeof BookmarksReadSchema>;

/**
 * 指定されたチャンネルのブックマーク一覧を取得します。
 * Slack APIの `bookmarks.list` メソッドに対応します。
 */
export const bookmarksReadDescription = '指定されたチャンネルのブックマーク一覧を取得します。';

/**
 * @param env {ToolEnv} SLACK_USER_TOKENを含む環境変数
 * @param input {BookmarksReadInput} ツールへの入力
 * @returns {Promise<object>} ブックマーク一覧
 */
export async function bookmarksRead(env: ToolEnv, input: BookmarksReadInput): Promise<object> {
  // 1. 入力検証
  const validatedInput = BookmarksReadSchema.parse(input);

  // 2. Slack API呼び出し
  const auth = new SlackAuthenticator(env.SLACK_USER_TOKEN);
  const slack = auth.getWebClient();

  const result = await slack.bookmarks.list({
    channel_id: validatedInput.channel_id,
  });

  if (!result.ok) {
    handleSlackError(result);
  }

  // 3. レスポンス整形
  return {
    bookmarks: result.bookmarks || [],
  };
}