import { z } from 'zod';
import { ToolEnv } from '../../shared/types.js';
import { ExtendedSearchQuerySchema } from '../../shared/validators.js';
import { SlackSearchService } from './shared/search-base.js';
import { buildSearchQuery } from './shared/search-modifiers.js';

export const SearchReadSchema = ExtendedSearchQuerySchema;
export type SearchReadInput = z.infer<typeof SearchReadSchema>;

/**
 * 汎用メッセージ検索を実行します。
 * Slack APIの `search.messages` メソッドに対応します。
 */
export const searchReadDescription = '汎用メッセージ検索を実行します。';

/**
 * @param env {ToolEnv} SLACK_USER_TOKENを含む環境変数
 * @param input {SearchReadInput} ツールへの入力
 * @returns {Promise<object>} 検索結果とページネーション情報
 */
export async function searchRead(env: ToolEnv, input: SearchReadInput): Promise<object> {
  // 1. 入力検証
  const validatedInput = SearchReadSchema.parse(input);

  // 2. 拡張クエリの構築
  const enhancedQuery = buildSearchQuery(validatedInput.query, {
    dateFrom: validatedInput.date_from,
    dateTo: validatedInput.date_to,
    fromUser: validatedInput.from_user,
    toUser: validatedInput.to_user,
    channel: validatedInput.channel,
    hasLinks: validatedInput.has_links,
    hasFiles: validatedInput.has_files,
    hasImages: validatedInput.has_images,
    hasStars: validatedInput.has_stars,
    hasPins: validatedInput.has_pins,
  });

  // 3. Slack API呼び出し
  const searchService = new SlackSearchService(env);
  const result = await searchService.searchMessages({
    query: enhancedQuery,
    sort: validatedInput.sort,
    sort_dir: validatedInput.sort_dir,
    highlight: validatedInput.highlight,
    count: validatedInput.count,
    page: validatedInput.page,
  });
  
  // 4. レスポンスをそのまま返す
  return result;
}