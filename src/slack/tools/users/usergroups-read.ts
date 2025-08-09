import { z } from 'zod';
import { SlackAuthenticator } from '../../shared/auth.js';
import { handleSlackError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const UsergroupsReadSchema = z.object({
  include_disabled: z.boolean().default(false).optional().describe('無効なユーザーグループを含めるか'),
  include_count: z.boolean().default(false).optional().describe('各ユーザーグループのユーザー数を含めるか'),
  include_users: z.boolean().default(false).optional().describe('各ユーザーグループのユーザーリストを含めるか'),
});

export type UsergroupsReadInput = z.infer<typeof UsergroupsReadSchema>;

/**
 * ワークスペースのユーザーグループ一覧を取得します。
 * Slack APIの `usergroups.list` メソッドに対応します。
 */
export const usergroupsReadDescription = 'ワークスペースのユーザーグループ一覧を取得します。';

/**
 * @param env {ToolEnv} SLACK_USER_TOKENを含む環境変数
 * @param input {UsergroupsReadInput} ツールへの入力
 * @returns {Promise<object>} ユーザーグループ一覧
 */
export async function usergroupsRead(env: ToolEnv, input: UsergroupsReadInput): Promise<object> {
  // 1. 入力検証
  const validatedInput = UsergroupsReadSchema.parse(input);

  // 2. Slack API呼び出し
  const auth = new SlackAuthenticator(env.SLACK_USER_TOKEN);
  const slack = auth.getWebClient();

  const result = await slack.usergroups.list({
    include_disabled: validatedInput.include_disabled,
    include_count: validatedInput.include_count,
    include_users: validatedInput.include_users,
  });

  if (!result.ok) {
    handleSlackError(result);
  }

  // 3. レスポンス整形
  return {
    usergroups: result.usergroups || [],
  };
}