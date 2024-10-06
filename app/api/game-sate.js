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
  try {
    const client = await clientPromise;
    const db = client.db('goldore'); // Replace with your database name

    if (req.method === 'GET') {
      const userId = parseInt(req.query.userId, 10);
      
      // Validate userId
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const gameState = await db.collection('game-users').findOne({ userId });

      if (gameState) {
        return res.status(200).json(gameState);
      } else {
        return res.status(404).json({ message: 'Game state not found' });
      }
    } else if (req.method === 'POST') {
      const { userId, gameState } = req.body;

      // Validate input
      if (!userId || !gameState) {
        return res.status(400).json({ message: 'Missing userId or gameState' });
      }

      await db.collection('game-users').updateOne(
        { userId },
        { $set: { ...gameState } },
        { upsert: true } // Insert a new document if no match is found
      );
      return res.status(201).json({ message: 'Game state saved successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error); // Log the error for debugging
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
