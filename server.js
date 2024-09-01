'use strict';

const fastify = require('fastify');

module.exports = async ({ app: appConfig, server: serverConfig }) => {
  const app = fastify({...serverConfig});

  app.get('/', async function helloHandler(request, reply) {
    return { helloFrom: this.server.address() };
  });

  await app.listen({
    port: appConfig.port,
    host: appConfig.host,
  });

  return app;
};
