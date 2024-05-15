import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import redisC from '../utils/redis';
import dbC from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');

      const [email, password] = credentials.split(':');
      const exUser = await dbC.userColl.findOne({ email });
      if (!exUser) return res.status(401).json({ error: 'Unauthorized' });

      const hashedPassword = sha1(password);
      if (exUser.password !== hashedPassword) return res.status(401).json({ error: 'Unauthorized' });

      const token = uuidv4();
      await redisC.set(`auth_${token}`, exUser._id.toString(), 60 * 60 * 24);
      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error during authentication:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getDisconnect(req, res) {
    try {
      // console.log(req.headers['x-token']);
      const authHeader = req.headers['x-token'];
      if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      // const token = authHeader.split(' ')[1];
      const userId = await redisC.get(`auth_${authHeader}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      await redisC.del(`auth_${authHeader}`);
      return res.status(204).send();
    } catch (error) {
      console.error('Error during logout:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default AuthController;
