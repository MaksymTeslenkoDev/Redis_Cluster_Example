'use strict';

const fp = require('fastify-plugin');
const redis = require('redis');
const Cache = require('../src/cache');

const TTL_DEFAULT = 60 * 5; // 5 minutes
async function cache(fastify) {
  const client = await redis.createClient({
    rootNodes: [{ url: 'redis://localhost:6379' }],
  });

  await client.connect();
  const cache = new Cache({
    cacheClient: client,
    ttlDefault: TTL_DEFAULT,
  });

  fastify.decorate('cache', cache);

  client.on('error', (err) => {
    fastify.log.error(`Error happend in Redis: ${err.message}`);
  });

  fastify.addHook('onClose', async (instance, done) => {
    fastify.log.info('Closing Redis connection');
    client.quit();
  });
}

module.exports = fp(cache);
