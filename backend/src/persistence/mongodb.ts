import mongoose from 'mongoose'

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/canvas'

export async function connectMongo(): Promise<void> {
  await mongoose.connect(MONGO_URL)
  console.log('MongoDB connected')
}

mongoose.connection.on('error', (err) => console.error('MongoDB error:', err))
