import { MongoClient } from "mongodb";

const uri = process.env.NEXT_PUBLIC_DATABASE_URL;
if (!uri) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

const client = new MongoClient(uri);

export default async function ConnectDb() {
  try {
    if (!client.isConnected) {
      await client.connect();
      console.log("Connected to MongoDB");
    }
    const db = client.db("Orders");
    const wallet = db.collection("Wallet");
    const distributor = db.collection("distributorData");
    return { wallet, distributor };
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    throw new Error("Failed to connect to database");
  }
}
