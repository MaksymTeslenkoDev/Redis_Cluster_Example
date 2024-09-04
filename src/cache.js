'use strict';
const { faker } = require('@faker-js/faker');
const timers = require('node:timers/promises');

const DEFAULT_LOCK_TTL = 5;
const DEFAULT_KEY_TTL = 60; // 1 minute

class Cache {
  constructor({
    cacheClient,
    ttl = DEFAULT_KEY_TTL,
    lockTTL = DEFAULT_LOCK_TTL,
  }) {
    this.cache = cacheClient;
    this.ttl = ttl;
    this.lockTTL = lockTTL;
  }

  async set(key, value, ttl = this.ttl) {
    return await this.cache.set(key, value, 'EX', ttl);
  }

  async get(key, params) {
    let retries = params?.retries || 10;
    const value = await this.cache.get(key);
    if (value !== null) {
      return value;
    }

    // Cache miss - try to acquire lock to prevent stampede
    const lockKey = `${key}:lock`;
    const lockAcquired = await this.cache.set(
      lockKey,
      'locked',
      'NX',
      'EX',
      this.lockTTL,
    );

    if (lockAcquired) {
      try {
        
        const data = await this.getData({ key, ...params });
        await this.set(key, data, this.ttlDefault);
        return data;
      } finally {
        console.log('Releasing lock ');
        await this.cache.del(lockKey);
      }
    } else {
      while (retries > 0) {
        const [value, lock] = await this.cache
          .multi()
          .get(key)
          .get(lockKey)
          .exec();

        // lock = [null, null] | [null, 'locked']
        // value = [null, null] | [null, 'value']

        if (lock[1] === null) {
          await this.cache.set(lockKey, 'locked', 'EX', this.lockTTL);
        }

        if (value[1] !== null) {
          console.log('Cache populated');
          return value;
        }

        console.log('waiting for cache to be populated');
        retries--;
        await timers.setTimeout(500);
      }
      throw new Error('Cache miss after 5 retries');
    }
  }

  async getData() {}
}

class WordsCache extends Cache {
  constructor(cacheClient, params) {
    super({ cacheClient, ...params });
  }
  async getData({ key }) {
    console.log('Fetching words data from db for key: ', key);
    await timers.setTimeout(2000);
    return await Promise.resolve(faker.word.sample());
  }
}

module.exports = {
  WordsCache,
};
