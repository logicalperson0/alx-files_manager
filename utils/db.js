import { MongoClient } from 'mongodb';

const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || '27017', 10);
const database = process.env.DB_DATABASE || 'files_manager';

const url = `mongodb://${host}:${port}`;

class DBClient {
  constructor() {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
      .then((client) => {
        this.db = client.db(database);
        this.userColl = this.db.collection('users');
        this.fileColl = this.db.collection('files');
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  isAlive() {
    return (Boolean(this.db));
  }

  async nbUsers() {
    const countU = this.userColl.countDocuments();
    return countU;
  }

  async nbFiles() {
    const countF = this.fileColl.countDocuments();
    return countF;
  }
}

const dbClient = new DBClient();

export default dbClient;
