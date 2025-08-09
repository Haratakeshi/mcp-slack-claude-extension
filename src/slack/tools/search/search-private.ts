import { z } from 'zod';
import { ToolEnv } from '../../shared/types.js';
import { SpecializedSearchSchema } from '../../shared/validators.js';
import { SlackSearchService } from './shared/search-base.js';
import { buildSearchQuery } from './shared/search-modifiers.js';

export const SearchPrivateSchema = SpecializedSearchSchema.extend({
  private_channel: z.string().optional().describe('検索対象のプライベートチャンネル（指定しない場合は全プライベートチャンネルを検索）'),
});

export type SearchPrivateInput = z.infer<typeof SearchPrivateSchema>;

/**
 * プライベートチャンネル検索を実行します。
 * 内部的にプライベートチャンネルに限定した検索条件を付与します。
 * Slack APIの `search.messages` メソッドに対応します。
 */
export const searchPrivateDescription = 'プライベートチャンネル検索を実行します。';

/**
 * @param env {ToolEnv} SLACK_USER_TOKENを含む環境変数
 * @param input {SearchPrivateInput} ツールへの入力
 * @returns {Promise<object>} 検索結果とページネーション情報
 */
export async function searchPrivate(env: ToolEnv, input: SearchPrivateInput): Promise<object> {
  // 1. 入力検証
  const validatedInput = SearchPrivateSchema.parse(input);

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

  // 3. プライベートチャンネル特有の条件を追加
  if (validatedInput.private_channel) {
    const channelModifier = validatedInput.private_channel.startsWith('#')
      ? validatedInput.private_channel
      : `#${validatedInput.private_channel}`;
    enhancedQuery += ` in:${channelModifier}`;
  } else {
    // 全プライベートチャンネルを検索する場合
    enhancedQuery += ` is:private`;
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