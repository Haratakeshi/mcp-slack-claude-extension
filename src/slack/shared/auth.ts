import { WebClient } from '@slack/web-api';

/**
 * Slackの認証を管理するクラス
 */
export class SlackAuthenticator {
  private client: WebClient;

  constructor(private token?: string) {
    if (!token) {
      throw new Error('Slack token is not provided.');
    }
    this.client = new WebClient(token);
  }

  /**
   * トークンが有効な形式か検証します
   * @returns {boolean}
   */
  public validateToken(): boolean {
    if (!this.client.token) {
      return false;
    }
    // xoxp- (User token) or xoxb- (Bot token)
    return this.client.token.startsWith('xoxp-') || this.client.token.startsWith('xoxb-');
  }

  /**
   * 初期化済みのWebClientインスタンスを取得します
   * @returns {WebClient}
   */
  public getWebClient(): WebClient {
    if (!this.validateToken()) {
      throw new Error('Invalid Slack token format.');
    }
    return this.client;
  }
}