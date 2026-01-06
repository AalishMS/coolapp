import express, { RequestHandler } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import hpp from 'hpp'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import passwordRoutes from './routes/passwordRoutes.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'
import { securityHeaders, hidePoweredBy, noCacheHeaders } from './middleware/securityHeaders.js'
import { validateJwtConfig } from './utils/jwt.js'
import { apiVersioning } from './middleware/apiVersioning.js'

dotenv.config()

const app = express()

app.use(helmet({
  contentSecurityPolicy: false,
}))

app.use(securityHeaders())
app.use(hidePoweredBy)
app.use(noCacheHeaders)

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'api-version'],
}))

app.use(hpp())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

app.use(apiVersioning({
  header: 'api-version',
  defaultVersion: 'v1',
  allowedVersions: ['v1'],
}))

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected'
  
  res.status(dbState === 1 ? 200 : 503).json({ 
    status: dbState === 1 ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbStatus
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/password', passwordRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const validateConfiguration = (): void => {
  console.log('🔐 Validating JWT configuration...')
  
  const jwtValidation = validateJwtConfig()
  
  if (!jwtValidation.valid) {
    console.error('❌ JWT Configuration Errors:')
    jwtValidation.errors.forEach((error) => {
      console.error(`   - ${error}`)
    })
    console.error('\n⛔ Server cannot start without proper JWT configuration.')
    console.error('   Please update server/.env with secure JWT secrets.\n')
    process.exit(1)
  }

  const secretLength = process.env.JWT_SECRET?.length || 0
  console.log(`✅ JWT_SECRET configured (${secretLength} characters)`)
  
  const refreshLength = process.env.JWT_REFRESH_SECRET?.length || 0
  console.log(`✅ JWT_REFRESH_SECRET configured (${refreshLength} characters)`)

  if (process.env.NODE_ENV === 'production') {
    if (secretLength < 32) {
      console.warn('⚠️  Warning: JWT_SECRET should be at least 32 characters for security')
    }
    if (refreshLength < 32) {
      console.warn('⚠️  Warning: JWT_REFRESH_SECRET should be at least 32 characters for security')
    }
  }

  console.log('✅ JWT configuration validated successfully!\n')
}

const startServer = async () => {
  validateConfiguration()
  
  try {
    await connectDB()
    console.log('✅ Database connected successfully!\n')
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
      console.log(`📝 API available at http://localhost:${PORT}/api`)
      console.log(`🏥 Health check at http://localhost:${PORT}/api/health\n`)
    })
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    process.exit(1)
  }
}

startServer()

export default app
