import redisC from '../utils/redis';
import dbC from '../utils/db';

class AppController {
  static async getStatus(req, res) {
    res.status(200).json({ redis: redisC.isAlive(), db: dbC.isAlive() });
  }

  static async getStats(req, res) {
    res.status(200).json({ users: await dbC.nbUsers(), files: await dbC.nbFiles() });
  }
}

export default AppController;
