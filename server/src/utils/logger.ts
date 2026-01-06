import winston from 'winston'
import path from 'path'

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`
    if (Object.keys(metadata).length > 0) {
      log += ` ${JSON.stringify(metadata)}`
    }
    if (stack) {
      log += `\n${stack}`
    }
    return log
  })
)

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
  ],
})

if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    })
  )
  logger.add(
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    })
  )
}

export default logger

export const logRequest = (req: any, res: any, next: any) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    }

    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', logData)
    } else {
      logger.info('Request completed', logData)
    }
  })

  next()
}

export const logSecurityEvent = (
  event: string,
  details: Record<string, unknown>
) => {
  logger.warn(`SECURITY EVENT: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...details,
  })
}

export const logAuthEvent = (
  event: string,
  details: Record<string, unknown>
) => {
  logger.info(`AUTH EVENT: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...details,
  })
}

export const logError = (error: Error, context?: Record<string, unknown>) => {
  logger.error('Application error', {
    error: error.message,
    stack: error.stack,
    ...context,
  })
}
