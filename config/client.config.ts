import { MongoClient, Db } from "mongodb";

export const dbName = "movieDB";
const uri: string = process.env.MONGODB_CONNECTION_URI!;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(uri);
  const db = await client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
