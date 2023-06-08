import Redis from 'ioredis';

interface CacheGenerateKey {
  recommendedPostKey: (postId: string) => string;
  postCacheKey: (username: string, postUrlSlug: string) => string;
  userCacheKey: (username: string) => string;
  postSeriesKey: (username: string, seriesUrlSlug: string) => string;
  updateEmailKey: (code: string) => string;
}

class Cache {
  client: Redis.Redis | null = null;

  connect(): void {
    this.client = new Redis({
      maxRetriesPerRequest: 3,
      host: process.env.REDIS_HOST || 'localhost',
    });
  }

  remove(...keys: string[]): Promise<number> {
    if (!this.client) {
      this.connect();
    }
    return this.client!.del(...keys);
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      return;
    }
    return Promise.resolve();
  }

  get generateKey(): CacheGenerateKey {
    return {
      recommendedPostKey: (postId: string) => `${postId}:recommend`,
      postCacheKey: (username: string, postUrlSlug: string) => `ssr:/@${username}/${postUrlSlug}`,
      userCacheKey: (username: string) => `ssr:/@${username}`,
      postSeriesKey: (username: string, seriesUrlSlug: string) =>
        `ssr:/@${username}/series/${seriesUrlSlug}`,
      updateEmailKey: (code: string) => `email:/${code}`,
    };
  }
}

const cache = new Cache();
cache.connect();

export default cache;
