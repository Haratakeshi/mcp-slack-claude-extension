import { SlackAuthenticator } from '../../../shared/auth.js';
import { handleSlackError } from '../../../shared/error-handler.js';
import { ToolEnv } from '../../../shared/types.js';
import { WebClient } from '@slack/web-api';

export interface BaseSearchOptions {
  query: string;
  sort?: 'score' | 'timestamp';
  sort_dir?: 'asc' | 'desc';
  highlight?: boolean;
  count?: number;
  page?: number;
}

export interface SearchMessagesOptions extends BaseSearchOptions {
  // search.messages 固有のオプションがあれば追加
}

export interface SearchFilesOptions extends BaseSearchOptions {
  // search.files 固有のオプション
}

export class SlackSearchService {
  private auth: SlackAuthenticator;
  private slack: WebClient;

  constructor(env: ToolEnv) {
    this.auth = new SlackAuthenticator(env.SLACK_USER_TOKEN);
    this.slack = this.auth.getWebClient();
  }

  // メッセージ検索の共通処理
  async searchMessages(options: SearchMessagesOptions): Promise<object> {
    const result = await this.slack.search.messages({
      query: options.query,
      sort: options.sort,
      sort_dir: options.sort_dir,
      highlight: options.highlight,
      count: options.count,
      page: options.page,
    });

    if (!result.ok) {
      handleSlackError(result);
    }

    return {
      messages: result.messages || {},
      paging: result.messages?.paging || {},
      total: result.messages?.total || 0,
    };
  }

  // ファイル検索の共通処理
  async searchFiles(options: SearchFilesOptions): Promise<object> {
    const result = await this.slack.search.files({
      query: options.query,
      sort: options.sort,
      sort_dir: options.sort_dir,
      highlight: options.highlight,
      count: options.count,
      page: options.page,
    });

    if (!result.ok) {
      handleSlackError(result);
    }

    return {
      files: result.files || {},
      paging: result.files?.paging || {},
      total: result.files?.total || 0,
    };
  }
}