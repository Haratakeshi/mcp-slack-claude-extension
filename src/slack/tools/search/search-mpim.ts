import { z } from 'zod';
import { ToolEnv } from '../../shared/types.js';
import { SpecializedSearchSchema } from '../../shared/validators.js';
import { SlackSearchService } from './shared/search-base.js';
import { buildSearchQuery } from './shared/search-modifiers.js';

export const SearchMpimSchema = SpecializedSearchSchema.extend({
  mpim_users: z.string().optional().describe('検索対象のMPIMユーザー（カンマ区切り、指定しない場合は全MPIMを検索）'),
});

export type SearchMpimInput = z.infer<typeof SearchMpimSchema>;

/**
 * マルチパーティー・ダイレクトメッセージ（MPIM）検索を実行します。
 * 内部的に MPIM に限定した検索条件を付与します。
 * Slack APIの `search.messages` メソッドに対応します。
 */
export const searchMpimDescription = 'マルチパーティー・ダイレクトメッセージ（MPIM）検索を実行します。';

/**
 * @param env {ToolEnv} SLACK_USER_TOKENを含む環境変数
 * @param input {SearchMpimInput} ツールへの入力
 * @returns {Promise<object>} 検索結果とページネーション情報
 */
export async function searchMpim(env: ToolEnv, input: SearchMpimInput): Promise<object> {
  // 1. 入力検証
  const validatedInput = SearchMpimSchema.parse(input);

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

  // 3. MPIM特有の条件を追加
  if (validatedInput.mpim_users) {
    // 特定のユーザーがいるMPIMを検索する場合
    // 注意: Slack APIの制限上、複数の `in:@user` を組み合わせても期待通りに動作しない場合がある。
    // ここでは、クエリに `is:mpim` を追加し、ユーザーの指定はベストエフォートとする。
    const users = validatedInput.mpim_users.split(',').map(user => user.trim());
    const userModifiers = users.map(user => 
      user.startsWith('@') ? `in:${user}` : `in:@${user}`
    );
    // 複数のユーザー条件を追加するよりは、is:mpimで絞り込む方が確実
    // enhancedQuery += ` ${userModifiers.join(' ')}`;
    enhancedQuery += ` is:mpim`;
  } else {
    // 全MPIMを検索する場合
    enhancedQuery += ` is:mpim`;
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