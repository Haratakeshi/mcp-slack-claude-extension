import { SlackUser, SlackChannel, SlackMessage } from './types.js';

/**
 * 整形後のユーザー情報
 */
export interface TransformedUser {
  id: string;
  name: string;
  is_bot: boolean;
}

/**
 * 整形後のチャンネル情報
 */
export interface TransformedChannel {
  id: string;
  name: string;
  topic: string;
  purpose: string;
}

/**
 * 整形後のメッセージ情報
 */
export interface TransformedMessage {
  user_id: string;
  text: string;
  timestamp: string;
  thread_timestamp?: string;
  reply_count: number;
}

/**
 * Slackのタイムスタンプ (e.g., "1355517523.000005") を "YYYY-MM-DD HH:mm:ss" 形式に変換する
 * @param ts Slackのタイムスタンプ文字列
 * @returns フォーマットされた日時文字列
 */
function formatTimestamp(ts: string): string {
  if (!ts) return '';
  const date = new Date(parseFloat(ts) * 1000);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).replace(/\//g, '-');
}

/**
 * Slackのユーザー情報を整形する
 * @param user SlackUserオブジェクト
 * @returns TransformedUserオブジェクト
 */
export function transformUser(user: SlackUser): TransformedUser {
  return {
    id: user.id,
    name: user.real_name || user.name || user.profile?.display_name || 'Unknown User',
    is_bot: user.is_bot || false,
  };
}

/**
 * Slackのチャンネル情報を整形する
 * @param channel SlackChannelオブジェクト
 * @returns TransformedChannelオブジェクト
 */
export function transformChannel(channel: SlackChannel): TransformedChannel {
  return {
    id: channel.id,
    name: channel.name || 'Unknown Channel',
    topic: channel.topic?.value || '',
    purpose: channel.purpose?.value || '',
  };
}

/**
 * Slackのメッセージ情報を整形する
 * @param message SlackMessageオブジェクト
 * @returns TransformedMessageオブジェクト
 */
export function transformMessage(message: SlackMessage): TransformedMessage {
  return {
    user_id: message.user || 'Unknown User',
    text: message.text || '',
    timestamp: formatTimestamp(message.ts),
    thread_timestamp: message.thread_ts ? formatTimestamp(message.thread_ts) : undefined,
    reply_count: message.reply_count || 0,
  };
}
/**
 * 日付文字列 (e.g., "2025-08-25", "2025-08-25 12:30:00") をSlackのUNIXタイムスタンプ文字列に変換する
 * @param dateString 日付文字列
 * @returns Slackのタイムスタンプ文字列 or undefined
 */
export function toSlackTimestamp(dateString: string | undefined): string | undefined {
  if (!dateString) return undefined;

  // UNIXタイムスタンプ形式の入力はそのまま返す
  if (/^\d{10}(\.\d+)?$/.test(dateString)) {
    return dateString;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    // 無効な日付文字列の場合はundefinedを返す
    return undefined;
  }

  return (date.getTime() / 1000).toFixed(6);
}