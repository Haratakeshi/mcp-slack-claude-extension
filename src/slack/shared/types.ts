import { z } from 'zod';
import {
  PaginationSchema,
  ChannelIdSchema,
  TimestampSchema,
  SearchQuerySchema,
} from './validators.js';

/**
 * ページネーション入力の型
 */
export type PaginationInput = z.infer<typeof PaginationSchema>;

/**
 * チャンネルID入力の型
 */
export type ChannelIdInput = z.infer<typeof ChannelIdSchema>;

/**
 * タイムスタンプ範囲入力の型
 */
export type TimestampInput = z.infer<typeof TimestampSchema>;

/**
 * 検索クエリ入力の型
 */
export type SearchQueryInput = z.infer<typeof SearchQuerySchema>;

/**
 * Slack APIの基本的なエラーレスポンスの型
 */
export interface SlackAPIErrorResponse {
  ok: false;
  error: string;
}

/**
 * 全てのツールで利用可能な環境変数の型
 */
export interface ToolEnv {
  SLACK_USER_TOKEN: string;
  SLACK_BOT_TOKEN: string;
  [key: string]: any;
}