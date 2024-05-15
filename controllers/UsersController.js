import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import dbC from '../utils/db';
import redisC from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    try {
      // console.log(req.body.email);
      const email = req.body ? req.body.email : null;
      const password = req.body ? req.body.password : null;

      // validation chks
      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }
      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      const existingUser = await dbC.userColl.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }
      const hashedPassword = sha1(password);

      const newUser = {
        email,
        password: hashedPassword,
      };
      const newRes = await dbC.userColl.insertOne(newUser);

      const createdUser = {
        id: newRes.insertedId,
        email,
      };

      return res.status(201).json(createdUser);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Error occurred' });
    }
  }

  static async getMe(req, res) {
    try {
      // Extract token from header
      const authHeader = req.headers['x-token'];
      if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // const token = authHeader.split(' ')[1];

      // Retrieve user based on token
      const userId = await redisC.get(`auth_${authHeader}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Retrieve user details from database
      const user = await dbC.userColl.findOne({ _id: ObjectId(userId) },
        { projection: { id: 1, email: 1 } });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Return user object with only email and id
      return res.status(200).json(user);
    } catch (error) {
      console.error('Error retrieving user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default UsersController;
