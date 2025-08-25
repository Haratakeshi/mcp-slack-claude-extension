import { z } from 'zod';
import { SlackAuthenticator } from '../../shared/auth.js';
import { handleSlackError } from '../../shared/error-handler.js';
import { PaginationSchema } from '../../shared/validators.js';
import { ToolEnv, SlackChannel } from '../../shared/types.js';
import { transformChannel } from '../../shared/transformer.js';

// 入力スキーマを定義
export const ChannelsReadSchema = PaginationSchema.extend({
  team_id: z.string().optional().describe('情報を取得するチームID'),
  types: z.string().default('public_channel').optional().describe('取得する会話タイプ (カンマ区切り)'),
});

export type ChannelsReadInput = z.infer<typeof ChannelsReadSchema>;

/**
 * ワークスペースのチャンネル一覧を取得します。
 * Slack APIの `conversations.list` メソッドに対応します。
 */
export const channelsReadDescription = 'ワークスペースのチャンネル一覧を、整形された形式で取得します。';

/**
 * @param env {ToolEnv} SLACK_USER_TOKENを含む環境変数
 * @param input {ChannelsReadInput} ツールへの入力
 * @returns {Promise<object>} チャンネル一覧とページネーション情報
 */
export async function channelsRead(env: ToolEnv, input: ChannelsReadInput): Promise<object> {
  // 1. 入力検証
  const validatedInput = ChannelsReadSchema.parse(input);

  // 2. Slack API呼び出し
  const auth = new SlackAuthenticator(env.SLACK_USER_TOKEN);
  const slack = auth.getWebClient();

  const result = await slack.conversations.list({
    cursor: validatedInput.cursor,
    limit: validatedInput.limit,
    team_id: validatedInput.team_id,
    types: validatedInput.types,
  });

  if (!result.ok) {
    handleSlackError(result);
  }

  // 3. レスポンス整形
  const transformedChannels = (result.channels as SlackChannel[] || []).map(transformChannel);

  return {
    channels: transformedChannels,
    response_metadata: result.response_metadata,
  };
}