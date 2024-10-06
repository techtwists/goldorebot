import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;  // Safely access the URI from environment variables

let cachedClient = null;  // Cache the client for reuse

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  // Create a new MongoClient instance and connect
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  cachedClient = client;  // Cache the client for future use
  return client;
}

export default async function handler(req, res) {
  const { method } = req;

  const client = await connectToDatabase();
  const db = client.db('goldore');  // Use your specific database name
  const collection = db.collection('game-users');  // Collection to store user game data

  switch (method) {
    case 'GET': {
      const { userId } = req.query;
      const gameState = await collection.findOne({ userId: parseInt(userId) });
      if (gameState) {
        res.status(200).json(gameState);
      } else {
        res.status(404).json({ message: 'Game state not found' });
      }
      break;
    }
    case 'POST': {
      const { userId, gameState } = req.body;
      const result = await collection.updateOne(
        { userId: parseInt(userId) },
        { $set: gameState },
        { upsert: true }
      );
      res.status(200).json({ message: 'Game state saved', result });
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
