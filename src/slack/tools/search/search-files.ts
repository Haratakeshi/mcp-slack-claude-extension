import { z } from 'zod';
import { ToolEnv } from '../../shared/types.js';
import { SlackSearchService } from './shared/search-base.js';
import { buildSearchQuery } from './shared/search-modifiers.js';

export const SearchFilesSchema = z.object({
  query: z.string().min(1, '検索クエリは必須です'),
  sort: z.enum(['score', 'timestamp']).default('score').optional(),
  sort_dir: z.enum(['asc', 'desc']).default('desc').optional(),
  count: z.number().min(1).max(100).default(20).optional(),
  page: z.number().min(1).default(1).optional(),
  
  // ファイル固有のフィルター
  channel: z.string().optional().describe('検索対象チャンネル名またはチャンネルID'),
  from_user: z.string().optional().describe('アップロード者のユーザー名またはユーザーID'),
  date_from: z.string().optional().describe('検索開始日 (YYYY-MM-DD形式)'),
  date_to: z.string().optional().describe('検索終了日 (YYYY-MM-DD形式)'),
});

export type SearchFilesInput = z.infer<typeof SearchFilesSchema>;

/**
 * ファイル検索を実行します。
 * Slack APIの `search.files` メソッドに対応します。
 */
export const searchFilesDescription = 'ファイル検索を実行します。';

/**
 * @param env {ToolEnv} SLACK_USER_TOKENを含む環境変数
 * @param input {SearchFilesInput} ツールへの入力
 * @returns {Promise<object>} 検索結果とページネーション情報
 */
export async function searchFiles(env: ToolEnv, input: SearchFilesInput): Promise<object> {
  // 1. 入力検証
  const validatedInput = SearchFilesSchema.parse(input);

  // 2. 拡張クエリの構築
  const enhancedQuery = buildSearchQuery(validatedInput.query, {
    dateFrom: validatedInput.date_from,
    dateTo: validatedInput.date_to,
    fromUser: validatedInput.from_user,
    channel: validatedInput.channel,
  });

  // 3. Slack API呼び出し
  const searchService = new SlackSearchService(env);
  const result = await searchService.searchFiles({
    query: enhancedQuery,
    sort: validatedInput.sort,
    sort_dir: validatedInput.sort_dir,
    count: validatedInput.count,
    page: validatedInput.page,
  });
  
  // 4. レスポンスをそのまま返す
  return result;
}