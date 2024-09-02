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
    return await this.cache.set(key, value, {
      EX: ttl,
    });
  }

  async get(key, params) {
    const value = await this.cache.get(key);
    if (value !== null) {
      return value;
    }

    // Cache miss - try to acquire lock to prevent stampede
    const lockKey = `${key}:lock`;
    const lockAcquired = await this.cache.set(lockKey, 'locked', {
      NX: true, // Only set the lock if it doesn't already exist
      EX: this.lockTTL, // Lock expiration to prevent stale locks
    });

    if (lockAcquired) {
      const data = await this.getData({ key, ...params });
      await this.set(key, data, this.ttlDefault);
      await this.cache.del(lockKey);
      return data;
    } else {
      while (true) {
        const cachedValue = await this.cache.get(key);
        if (cachedValue !== null) {
          return cachedValue;
        }

        await this.sleep(100); // Wait 100ms before checking again
      }
    }
  }

  async getData() {}
}

class WordsCache extends Cache {
  constructor(cacheClient, params) {
    super({ cacheClient, ...params });
  }
  async getData({ key }) {
    // This is a placeholder for a real db call
    console.log('Fetching words data from db for key: ', key);
    await timers.setTimeout(1000);
    return Promise.resolve(faker.word.sample());
  }
}

module.exports = {
  WordsCache,
};
