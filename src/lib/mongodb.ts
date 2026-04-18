import type { Db } from 'mongodb';
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI!;

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// 👇 reuse client if exists
const client = global._mongoClient ?? new MongoClient(uri, options);

// 👇 reuse promise if exists
const clientPromise = global._mongoClientPromise ?? client.connect();

if (!global._mongoClient) {
  global._mongoClient = client;
}

if (!global._mongoClientPromise) {
  global._mongoClientPromise = clientPromise;
}

export async function connectDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db('blogapp'); // DB name
}
