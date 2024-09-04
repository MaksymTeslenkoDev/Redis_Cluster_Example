module.exports = ({ envs }) => {
  const host = envs.REDIS_HOST || 'localhost';
  return Object.freeze({
    sentinel: {
      sentinels: [
        { host, port: 26379 },
        { host, port: 26380 },
        { host, port: 26381 },
      ],
      natMap: {
        '172.21.0.3:6379': { host, port: 6379 },
        '172.21.0.4:6379': { host, port: 6380 },
        '172.21.0.5:6379': { host, port: 6381 },
      },
      name: 'mymaster',
    },
  });
};
