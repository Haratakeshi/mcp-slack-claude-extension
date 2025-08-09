import { z } from 'zod';
import { SlackAuthenticator } from '../../shared/auth.js';
import { handleSlackError } from '../../shared/error-handler.js';
import { MessageHistorySchema } from '../../shared/validators.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const ImHistorySchema = MessageHistorySchema;

export type ImHistoryInput = z.infer<typeof ImHistorySchema>;

/**
 * ダイレクトメッセージ（IM）の履歴を取得します。
 * Slack APIの `conversations.history` メソッドに対応します。
 */
export const imHistoryDescription = 'ダイレクトメッセージ（IM）の履歴を取得します。';

/**
 * @param env {ToolEnv} SLACK_USER_TOKENを含む環境変数
 * @param input {ImHistoryInput} ツールへの入力
 * @returns {Promise<object>} メッセージ履歴とページネーション情報
 */
export async function imHistory(env: ToolEnv, input: ImHistoryInput): Promise<object> {
  // 1. 入力検証
  const validatedInput = ImHistorySchema.parse(input);

  // 2. Slack API呼び出し
  const auth = new SlackAuthenticator(env.SLACK_USER_TOKEN);
  const slack = auth.getWebClient();

  const result = await slack.conversations.history({
    channel: validatedInput.channel,
    cursor: validatedInput.cursor,
    limit: validatedInput.limit,
    oldest: validatedInput.oldest,
    latest: validatedInput.latest,
    inclusive: validatedInput.inclusive,
    include_all_metadata: validatedInput.include_all_metadata,
  });

  if (!result.ok) {
    handleSlackError(result);
  }

  // 3. レスポンス整形
  return {
    messages: result.messages || [],
    has_more: result.has_more || false,
    pin_count: result.pin_count || 0,
    response_metadata: result.response_metadata,
  };
}