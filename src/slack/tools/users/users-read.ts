import { z } from 'zod';
import { SlackAuthenticator } from '../../shared/auth.js';
import { handleSlackError } from '../../shared/error-handler.js';
import { PaginationSchema } from '../../shared/validators.js';
import { ToolEnv, SlackUser } from '../../shared/types.js';
import { transformUser } from '../../shared/transformer.js';

// 入力スキーマを定義
export const UsersReadSchema = PaginationSchema.extend({
  include_locale: z.boolean().default(false).optional().describe('ロケール情報を含めるか'),
});

export type UsersReadInput = z.infer<typeof UsersReadSchema>;

/**
 * ワークスペースのユーザー一覧を取得します。
 * Slack APIの `users.list` メソッドに対応します。
 */
export const usersReadDescription = 'ワークスペースのユーザー一覧を取得します。';

/**
 * @param env {ToolEnv} SLACK_USER_TOKENを含む環境変数
 * @param input {UsersReadInput} ツールへの入力
 * @returns {Promise<object>} ユーザー一覧とページネーション情報
 */
export async function usersRead(env: ToolEnv, input: UsersReadInput): Promise<object> {
  // 1. 入力検証
  const validatedInput = UsersReadSchema.parse(input);

  // 2. Slack API呼び出し
  const auth = new SlackAuthenticator(env.SLACK_USER_TOKEN);
  const slack = auth.getWebClient();

  const result = await slack.users.list({
    cursor: validatedInput.cursor,
    limit: validatedInput.limit,
    include_locale: validatedInput.include_locale,
  });

  if (!result.ok) {
    handleSlackError(result);
  }

  // 3. レスポンス整形
  const transformedUsers = (result.members as SlackUser[] || []).map(transformUser);

  return {
    users: transformedUsers,
    response_metadata: result.response_metadata,
    total_count: transformedUsers.length,
  };
}