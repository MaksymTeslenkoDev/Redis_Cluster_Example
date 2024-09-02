'use strict';

const fastify = require('fastify');
const { faker } = require('@faker-js/faker');
const cache = require('./plugins/redis.js');

module.exports = async ({ app: appConfig, server: serverConfig }) => {
  const app = fastify({ ...serverConfig });

  app.register(cache);

  app.post('/', async function seed(request, reply) {
    try {
      const key = 'hello';
      const value = 'world';

      return this.cache.set(key, value, 60 * 20);
    } catch (err) {
      return { error: err.message };
    }
  });

  app.get('/:id', async function getByKey(request, reply) {
    try {
      const { id } = request.params;
      const value = await this.wordsCache.get(id);
      if (!value) {
        value = faker.word.sample();
        await this.cache.set(id, value, 60 * 5);
      }
      return { word: value };
    } catch (err) {
      return { error: err.message };
    }
  });

  app.post('/add', async function addHandler(request, reply) {
    try {
      console.log('request.body ', request.body);
      const key = request.body?.key || faker.number.int();
      const value = request.body?.value || faker.word.sample();

      return this.cache.set(key.toString(), value, 60 * 5);
    } catch (err) {
      return { error: err.message };
    }
  });

  await app.listen({
    port: appConfig.port,
    host: appConfig.host,
  });

  return app;
};
