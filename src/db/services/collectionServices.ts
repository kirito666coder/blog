import { connectDb } from '../mongodb';

export const getCollection = async (collectionName: string) => {
  const collection = await connectDb();
  return collection.collection(collectionName);
};
