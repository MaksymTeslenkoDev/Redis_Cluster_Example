'use strict';
const { faker } = require('@faker-js/faker');

class Cache {
  constructor({ cacheClient, ttlDefault }) {
    this.cache = cacheClient;
    this.ttlDefault = ttlDefault;
  }

  async set(key, value, ttl = this.ttlDefault) {
    return await this.cache.set(key, value, {
      EX: ttl,
    });
  }

  async get(key, params) {
    const value = await this.cache.get(key);
    if (!value) {
      const data = await this.getData({ key });
      await this.set(key, data, { EX: this.ttlDefault });
    }
    return value;
  }

  async getData(params) {}
}

module.exports = Cache;
