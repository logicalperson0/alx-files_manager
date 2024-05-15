import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.Newclient = redis.createClient();
    this.getAsync = promisify(this.Newclient.get).bind(this.Newclient);
    this.Newclient
      .on('error', (err) => console.log(`${err.message}`));
    this.Newclient
      .on('connect', () => {});
  }

  isAlive() {
    return this.Newclient.connected;
  }

  async get(strKey) {
    return this.getAsync(strKey);
  }

  async set(key, value, duration) {
    return this.Newclient.SETEX(key, duration, value);
  }

  async del(key) {
    return this.Newclient.del(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
