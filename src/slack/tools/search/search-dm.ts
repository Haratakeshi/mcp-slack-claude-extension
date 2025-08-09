import { z } from 'zod';
import { ToolEnv } from '../../shared/types.js';
import { SpecializedSearchSchema } from '../../shared/validators.js';
import { SlackSearchService } from './shared/search-base.js';
import { buildSearchQuery } from './shared/search-modifiers.js';

export const SearchDmSchema = SpecializedSearchSchema.extend({
  dm_user: z.string().optional().describe('検索対象のDMユーザー（指定しない場合は全DMを検索）'),
});

export type SearchDmInput = z.infer<typeof SearchDmSchema>;

/**
 * ダイレクトメッセージ検索を実行します。
 * 内部的に DM に限定した検索条件を付与します。
 * Slack APIの `search.messages` メソッドに対応します。
 */
export const searchDmDescription = 'ダイレクトメッセージ検索を実行します。';

/**
 * @param env {ToolEnv} SLACK_USER_TOKENを含む環境変数
 * @param input {SearchDmInput} ツールへの入力
 * @returns {Promise<object>} 検索結果とページネーション情報
 */
export async function searchDm(env: ToolEnv, input: SearchDmInput): Promise<object> {
  // 1. 入力検証
  const validatedInput = SearchDmSchema.parse(input);

  // 2. 拡張クエリの構築
  let enhancedQuery = buildSearchQuery(validatedInput.query, {
    dateFrom: validatedInput.date_from,
    dateTo: validatedInput.date_to,
    fromUser: validatedInput.from_user,
    toUser: validatedInput.to_user,
    hasLinks: validatedInput.has_links,
    hasFiles: validatedInput.has_files,
    hasImages: validatedInput.has_images,
    hasStars: validatedInput.has_stars,
    hasPins: validatedInput.has_pins,
  });

  // 3. DM特有の条件を追加
  if (validatedInput.dm_user) {
    const userModifier = validatedInput.dm_user.startsWith('@')
      ? validatedInput.dm_user
      : `@${validatedInput.dm_user}`;
    enhancedQuery += ` in:${userModifier}`;
  } else {
    // 全DMを検索する場合は、パブリック・プライベートチャンネルを除外
    enhancedQuery += ` is:dm -in:#*`;
  }

  // 4. Slack API呼び出し
  const searchService = new SlackSearchService(env);
  const result = await searchService.searchMessages({
    query: enhancedQuery,
    sort: validatedInput.sort,
    sort_dir: validatedInput.sort_dir,
    highlight: validatedInput.highlight,
    count: validatedInput.count,
    page: validatedInput.page,
  });
  
  // 5. レスポンスをそのまま返す
  return result;
}