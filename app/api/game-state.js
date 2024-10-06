import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // Use global variable for the MongoClient in development mode to prevent multiple connections
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Use a new client instance in production mode
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('user'); // Use your actual database name

  if (req.method === 'GET') {
    const { userId } = req.query;

    try {
      const gameState = await db.collection('data').findOne({ userId: Number(userId) });
      if (gameState) {
        res.status(200).json(gameState);
      } else {
        const defaultGameState = {
          userId: Number(userId),
          score: 0,
          clickValue: 1,
          pickaxeLevel: 1,
          minerCount: 0,
          pickaxeCost: 10,
          minerCost: 50,
          userXP: 0,
          userLevel: 1,
          xpToNextLevel: 100,
        };
        await db.collection('game-users').insertOne(defaultGameState);
        res.status(200).json(defaultGameState);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch game state' });
    }
  } else if (req.method === 'POST') {
    const { userId, gameState } = req.body;

    try {
      const updatedGameState = await db.collection('game-users').findOneAndUpdate(
        { userId: Number(userId) },
        { $set: gameState },
        { returnDocument: 'after', upsert: true }
      );
      res.status(200).json(updatedGameState.value);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save game state' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
