import { z } from 'zod';

/**
 * ページネーションで使われる共通スキーマ
 */
export const PaginationSchema = z.object({
  cursor: z.string().optional().describe('ページネーションカーソル'),
  limit: z.number().min(1).max(1000).default(50).optional().describe('取得件数 (1-1000)'),
});

/**
 * チャンネルIDのスキーマ
 */
export const ChannelIdSchema = z.string().min(1, 'チャンネルIDは必須です');

/**
 * タイムスタンプ範囲のスキーマ
 */
export const TimestampSchema = z.object({
  oldest: z.string().optional().describe('取得範囲の開始タイムスタンプ'),
  latest: z.string().optional().describe('取得範囲の終了タイムスタンプ'),
});

/**
 * 検索クエリの共通スキーマ
 */
export const SearchQuerySchema = z.object({
  query: z.string().min(1, '検索クエリは必須です'),
  sort: z.enum(['score', 'timestamp']).default('score').optional().describe('ソート順'),
  sort_dir: z.enum(['asc', 'desc']).default('desc').optional().describe('ソート方向'),
  highlight: z.boolean().default(false).optional().describe('ハイライトの有無'),
  count: z.number().min(1).max(100).default(20).optional().describe('取得件数 (1-100)'),
  page: z.number().min(1).default(1).optional().describe('ページ番号'),
});

/**
 * 拡張検索クエリの共通スキーマ
 */
export const ExtendedSearchQuerySchema = SearchQuerySchema.extend({
  // 日付範囲指定
  date_from: z.string().optional().describe('検索開始日 (YYYY-MM-DD形式)'),
  date_to: z.string().optional().describe('検索終了日 (YYYY-MM-DD形式)'),
  
  // 送信者・受信者指定
  from_user: z.string().optional().describe('送信者のユーザー名またはユーザーID'),
  to_user: z.string().optional().describe('受信者のユーザー名またはユーザーID'),
  
  // チャンネル指定（汎用検索のみ）
  channel: z.string().optional().describe('検索対象チャンネル名またはチャンネルID'),
  
  // コンテンツタイプフィルター
  has_links: z.boolean().optional().describe('リンクを含むメッセージのみ'),
  has_files: z.boolean().optional().describe('ファイルを含むメッセージのみ'),
  has_images: z.boolean().optional().describe('画像を含むメッセージのみ'),
  has_stars: z.boolean().optional().describe('スターが付いたメッセージのみ'),
  has_pins: z.boolean().optional().describe('ピン留めされたメッセージのみ'),
});

/**
 * 特化ツール用（channelフィールドを除外）
 */
export const SpecializedSearchSchema = ExtendedSearchQuerySchema.omit({
  channel: true
});

/**
 * メッセージ履歴取得の共通スキーマ
 */
export const MessageHistorySchema = PaginationSchema.extend({
  channel: ChannelIdSchema.describe('履歴を取得するチャンネルID'),
  oldest: z.string().optional().describe('取得範囲の開始タイムスタンプ'),
  latest: z.string().optional().describe('取得範囲の終了タイムスタンプ'),
  inclusive: z.boolean().default(false).optional().describe('開始・終了時刻を含むか'),
  include_all_metadata: z.boolean().default(false).optional().describe('すべてのメタデータを含むか'),
});