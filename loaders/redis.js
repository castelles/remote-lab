const {env} = require('../utils/env');
const {createClient} = require('redis');

const redisClient = createClient({
  url: `redis://:${env.REDIS_PASS}@localhost`,
  legacyMode: true
});
redisClient.isReady=false;

redisClient.on('connect', () => {redisClient.isReady=false; console.log('Connecting to Redis...')});
redisClient.on('ready', () => {redisClient.isReady=true; console.log('Connected to Redis')});
redisClient.on('end', () => {redisClient.isReady=false; console.log('Disconnected from Redis')});
redisClient.on('error', (err) => {redisClient.isReady=false;});
redisClient.on('reconnecting', () => {redisClient.isReady=false; console.log('Trying to reconnect to Redis...')});

async function redisCon(){
  await redisClient.connect();
}

module.exports = {redisCon, redisClient};