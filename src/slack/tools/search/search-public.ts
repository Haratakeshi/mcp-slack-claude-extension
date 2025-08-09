import { z } from 'zod';
import { ToolEnv } from '../../shared/types.js';
import { SpecializedSearchSchema } from '../../shared/validators.js';
import { SlackSearchService } from './shared/search-base.js';
import { buildSearchQuery } from './shared/search-modifiers.js';

export const SearchPublicSchema = SpecializedSearchSchema.extend({
  public_channel: z.string().optional().describe('検索対象のパブリックチャンネル（指定しない場合は全パブリックチャンネルを検索）'),
});

export type SearchPublicInput = z.infer<typeof SearchPublicSchema>;

/**
 * パブリックチャンネル検索を実行します。
 * 内部的にパブリックチャンネルに限定した検索条件を付与します。
 * Slack APIの `search.messages` メソッドに対応します。
 */
export const searchPublicDescription = 'パブリックチャンネル検索を実行します。';

/**
 * @param env {ToolEnv} SLACK_USER_TOKENを含む環境変数
 * @param input {SearchPublicInput} ツールへの入力
 * @returns {Promise<object>} 検索結果とページネーション情報
 */
export async function searchPublic(env: ToolEnv, input: SearchPublicInput): Promise<object> {
  // 1. 入力検証
  const validatedInput = SearchPublicSchema.parse(input);

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

  // 3. パブリックチャンネル特有の条件を追加
  if (validatedInput.public_channel) {
    const channelModifier = validatedInput.public_channel.startsWith('#')
      ? validatedInput.public_channel
      : `#${validatedInput.public_channel}`;
    enhancedQuery += ` in:${channelModifier}`;
  } else {
    // 全パブリックチャンネルを検索する場合の条件
    // is:public修飾子でパブリックチャンネルに限定
    enhancedQuery += ` is:public`;
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