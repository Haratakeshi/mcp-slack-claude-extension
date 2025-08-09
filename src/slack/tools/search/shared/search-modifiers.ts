export interface SearchModifierOptions {
  dateFrom?: string;
  dateTo?: string;
  fromUser?: string;
  toUser?: string;
  channel?: string;
  hasLinks?: boolean;
  hasFiles?: boolean;
  hasImages?: boolean;
  hasStars?: boolean;
  hasPins?: boolean;
}

export class SearchModifierBuilder {
  private modifiers: string[] = [];

  // 日付範囲修飾子を追加
  addDateRange(from?: string, to?: string): this {
    if (from) this.modifiers.push(`after:${from}`);
    if (to) this.modifiers.push(`before:${to}`);
    return this;
  }

  // 送信者修飾子を追加
  addFromUser(user?: string): this {
    if (user) {
      const userModifier = user.startsWith('@') ? user : `@${user}`;
      this.modifiers.push(`from:${userModifier}`);
    }
    return this;
  }

  // 受信者修飾子を追加
  addToUser(user?: string): this {
    if (user) {
      const userModifier = user.startsWith('@') ? user : `@${user}`;
      this.modifiers.push(`to:${userModifier}`);
    }
    return this;
  }

  // チャンネル修飾子を追加
  addChannel(channel?: string): this {
    if (channel) {
      const channelModifier = channel.startsWith('#') ? channel : `#${channel}`;
      this.modifiers.push(`in:${channelModifier}`);
    }
    return this;
  }

  // コンテンツタイプ修飾子を追加
  addContentFilters(options: Pick<SearchModifierOptions, 'hasLinks' | 'hasFiles' | 'hasImages' | 'hasStars' | 'hasPins'>): this {
    if (options.hasLinks) this.modifiers.push('has:link');
    if (options.hasFiles) this.modifiers.push('has:file');
    if (options.hasImages) this.modifiers.push('has:image');
    if (options.hasStars) this.modifiers.push('has:star');
    if (options.hasPins) this.modifiers.push('has:pin');
    return this;
  }

  // 特化検索用の会話タイプ修飾子を追加
  addConversationType(type: 'dm' | 'mpim' | 'private' | 'public'): this {
    switch (type) {
      case 'dm':
        // DMの場合は特定の修飾子は不要（API側で制御）
        break;
      case 'mpim':
        // MPIMの場合も特定の修飾子は不要（API側で制御）
        break;
      case 'private':
        // プライベートチャンネルの場合も特定の修飾子は不要（API側で制御）
        break;
      case 'public':
        // パブリックチャンネルの場合も特定の修飾子は不要（API側で制御）
        break;
    }
    return this;
  }

  // 最終的なクエリを構築
  build(baseQuery: string): string {
    if (this.modifiers.length === 0) {
      return baseQuery;
    }
    return `${baseQuery} ${this.modifiers.join(' ')}`;
  }
}

// ユーティリティ関数
export function buildSearchQuery(baseQuery: string, options: SearchModifierOptions): string {
  return new SearchModifierBuilder()
    .addDateRange(options.dateFrom, options.dateTo)
    .addFromUser(options.fromUser)
    .addToUser(options.toUser)
    .addChannel(options.channel)
    .addContentFilters(options)
    .build(baseQuery);
}