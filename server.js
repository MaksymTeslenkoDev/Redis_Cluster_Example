'use strict';

const fastify = require('fastify');
const { faker } = require('@faker-js/faker');
const cache = require('./plugins/redis.js');

module.exports = async ({
  app: appConfig,
  server: serverConfig,
  redis: redisConfig,
}) => {
  const app = fastify({ ...serverConfig });

  app.register(cache, { redis: redisConfig });

  app.post('/', async function seed(request, reply) {
    try {
      const key = 'hello';
      const value = 'world';

      return await this.wordsCache.set(key, value, 10);
    } catch (err) {
      throw new Error(err.message);
    }
  });

  app.get('/:id', async function getByKey(request, reply) {
    try {
      const { id } = request.params;
      const value = await this.wordsCache.get(id);
      return { word: value };
    } catch (err) {
      throw new Error(err.message);
    }
  });

  app.post('/add', async function addHandler(request, reply) {
    try {
      const key = request.body?.key || faker.number.int();
      const value = request.body?.value || faker.word.sample();

      return this.wordsCache.set(key.toString(), value);
    } catch (err) {
      throw new Error(err.message);
    }
  });

  await app.listen({
    port: appConfig.port,
    host: appConfig.host,
  });

  return app;
};
