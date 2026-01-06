import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const testDbName = `test_${crypto.randomBytes(8).toString('hex')}`
process.env.MONGODB_URI = process.env.MONGODB_URI || `mongodb://localhost:27017/${testDbName}`
process.env.JWT_SECRET = `test_secret_${crypto.randomBytes(16).toString('hex')}`
process.env.JWT_REFRESH_SECRET = `test_refresh_secret_${crypto.randomBytes(16).toString('hex')}`
process.env.NODE_ENV = 'test'

const envPath = path.resolve(__dirname, '../../.env.test')
dotenv.config({ path: envPath })

export { testDbName }
