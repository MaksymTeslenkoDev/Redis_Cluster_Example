'use strict';

const fp = require('fastify-plugin');
const redis = require('redis');
const { WordsCache } = require('../src/cache');

async function cache(fastify) {
  const client = await redis.createClient({
    rootNodes: [{ url: 'redis://localhost:6379' }],
  });

  await client.connect();
  const wordsCache = new WordsCache(client, { ttl: 60 * 5 });

  fastify.decorate('wordsCache', wordsCache);

  client.on('error', (err) => {
    fastify.log.error(`Error happend in Redis: ${err.message}`);
  });

  fastify.addHook('onClose', async (instance, done) => {
    fastify.log.info('Closing Redis connection');
    client.quit();
  });
}

module.exports = fp(cache);
