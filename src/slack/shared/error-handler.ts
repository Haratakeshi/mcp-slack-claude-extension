/**
 * Slack API関連のエラーを表すカスタムエラークラス
 */
export class SlackAPIError extends Error {
  constructor(
    message: string,
    public slackError?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'SlackAPIError';
  }
}

/**
 * Slack APIからのエラーレスポンスをハンドリングし、SlackAPIErrorをスローします
 * @param error - Slack APIからのレスポンスまたは一般的なエラーオブジェクト
 */
export function handleSlackError(error: unknown): never {
  // Slack APIからのエラーレスポンス（{ ok: false, error: '...' }）をチェック
  if (error && typeof error === 'object' && 'ok' in error && error.ok === false && 'error' in error) {
    const slackError = error.error as string;
    throw new SlackAPIError(`Slack API Error: ${slackError}`, slackError);
  }

  // 一般的なErrorインスタンスをチェック
  if (error instanceof Error) {
    throw new SlackAPIError(`API call failed: ${error.message}`);
  }

  // その他の予期せぬエラー
  throw new SlackAPIError('An unknown API error occurred');
}