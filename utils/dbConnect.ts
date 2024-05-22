import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL ?? "";
const MONGODB_NAME = process.env.MONGODB_NAME ?? '';

if (!process.env.MONGODB_URL) {
    throw new Error("Please add your Mongo URL to .env.local");
}

if (!process.env.MONGODB_NAME) {
    throw new Error("Please add your Mongo DB name to .env.local");
}

export const connectMongo = async () => mongoose.connect(MONGODB_URL + MONGODB_NAME);

export const disconnectMongo = async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect()
    }
}
