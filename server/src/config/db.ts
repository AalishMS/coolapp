import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MAX_RETRIES = 5
const RETRY_DELAY = 5000

const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.error('MONGODB_URI is not defined in environment variables')
    process.exit(1)
  }

  let retries = 0

  while (retries < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      console.log(`MongoDB Connected: ${conn.connection.host}`)
      
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err)
      })

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected. Attempting to reconnect...')
      })

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected')
      })

      return
    } catch (error) {
      retries++
      console.error(`MongoDB connection attempt ${retries}/${MAX_RETRIES} failed:`, (error as Error).message)
      
      if (retries < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      } else {
        console.error('Max retries reached. Could not connect to MongoDB.')
        throw error
      }
    }
  }
}

export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1
}

export default connectDB
