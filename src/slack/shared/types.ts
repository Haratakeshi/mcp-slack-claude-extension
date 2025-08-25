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
/**
 * Slackのユーザー情報を表す型
 * APIレスポンスから必要な情報のみを抜粋
 */
export interface SlackUser {
  id: string;
  name?: string;
  real_name?: string;
  is_bot?: boolean;
  profile?: {
    display_name?: string;
    image_72?: string;
  };
}

/**
 * Slackのチャンネル情報を表す型
 * APIレスポンスから必要な情報のみを抜粋
 */
export interface SlackChannel {
  id: string;
  name?: string;
  is_channel?: boolean;
  is_group?: boolean;
  is_im?: boolean;
  is_private?: boolean;
  topic?: {
    value?: string;
  };
  purpose?: {
    value?: string;
  };
}

/**
 * Slackのメッセージ情報を表す型
 * APIレスポンスから必要な情報のみを抜粋
 */
export interface SlackMessage {
  type: string;
  user?: string;
  text?: string;
  ts: string; // タイムスタンプ (例: "1355517523.000005")
  thread_ts?: string;
  reply_count?: number;
  files?: any[]; // ファイル情報の型は必要に応じて詳細化
}