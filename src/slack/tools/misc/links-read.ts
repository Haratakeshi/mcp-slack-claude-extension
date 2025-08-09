import { z } from 'zod';
import { SlackAuthenticator } from '../../shared/auth.js';
import { handleSlackError } from '../../shared/error-handler.js';
import { SearchQuerySchema } from '../../shared/validators.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const LinksReadSchema = SearchQuerySchema.extend({
  in: z.string().optional().describe('検索対象チャンネル (例: #general, @username)'),
  from: z.string().optional().describe('特定のユーザーが投稿したリンクのみ検索'),
  has: z.string().default('link').optional().describe('検索条件 (link, image, video等)'),
});

export type LinksReadInput = z.infer<typeof LinksReadSchema>;

/**
 * ワークスペース内のリンクを含むメッセージを検索します。
 * Slack APIの `search.messages` メソッドを使用してリンクを検索します。
 */
export const linksReadDescription = 'ワークスペース内のリンクを含むメッセージを検索します。';

/**
 * @param env {ToolEnv} SLACK_USER_TOKENを含む環境変数
 * @param input {LinksReadInput} ツールへの入力
 * @returns {Promise<object>} リンクを含むメッセージの検索結果
 */
export async function linksRead(env: ToolEnv, input: LinksReadInput): Promise<object> {
  // 1. 入力検証
  const validatedInput = LinksReadSchema.parse(input);

  // 2. Slack API呼び出し
  const auth = new SlackAuthenticator(env.SLACK_USER_TOKEN);
  const slack = auth.getWebClient();

  // 検索クエリを構築
  let query = validatedInput.query;
  
  // has:linkを自動的に追加してリンクを含むメッセージのみ検索
  if (validatedInput.has && !query.includes(`has:${validatedInput.has}`)) {
    query = `${query} has:${validatedInput.has}`;
  }
  
  // チャンネル指定があれば追加
  if (validatedInput.in) {
    query = `${query} in:${validatedInput.in}`;
  }
  
  // ユーザー指定があれば追加
  if (validatedInput.from) {
    query = `${query} from:${validatedInput.from}`;
  }

  const result = await slack.search.messages({
    query: query.trim(),
    sort: validatedInput.sort,
    sort_dir: validatedInput.sort_dir,
    highlight: validatedInput.highlight,
    count: validatedInput.count,
    page: validatedInput.page,
  });

  if (!result.ok) {
    handleSlackError(result);
  }

  // 3. レスポンス整形
  return {
    messages: result.messages || {},
    query: query.trim(),
    paging: result.messages?.paging,
  };
}