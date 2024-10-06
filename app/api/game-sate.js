// pages/api/game-state.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // Ensure this is set in your Vercel environment variables

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // Use a global variable so the MongoDB client isn't constantly created
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new MongoClient
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  clientPromise = client.connect();
}

export default async (req, res) => {
  const client = await clientPromise;
  const db = client.db('goldore'); // Replace with your database name

  if (req.method === 'GET') {
    const userId = parseInt(req.query.userId, 10);
    const gameState = await db.collection('game-users').findOne({ userId });

    if (gameState) {
      res.status(200).json(gameState);
    } else {
      res.status(404).json({ message: 'Game state not found' });
    }
  } else if (req.method === 'POST') {
    const { userId, gameState } = req.body;
    await db.collection('game_states').updateOne(
      { userId },
      { $set: { ...gameState } },
      { upsert: true } // Insert a new document if no match is found
    );
    res.status(201).json({ message: 'Game state saved successfully' });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
