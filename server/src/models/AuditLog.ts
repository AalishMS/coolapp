import mongoose, { Document, Schema } from 'mongoose'

export type AuditAction =
  | 'user.login'
  | 'user.logout'
  | 'user.register'
  | 'user.password_change'
  | 'user.password_reset'
  | 'user.profile_update'
  | 'user.delete'
  | 'admin.role_change'
  | 'admin.user_ban'
  | 'admin.user_unban'
  | 'data.export'
  | 'data.import'
  | 'system.config_change'

export interface IAuditLog extends Document {
  action: AuditAction
  userId: string
  userEmail: string
  ip: string
  userAgent: string
  resourceType: string
  resourceId: string
  previousValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  metadata?: Record<string, unknown>
  success: boolean
  errorMessage?: string
  timestamp: Date
}

const auditLogSchema = new Schema<IAuditLog>({
  action: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  resourceType: {
    type: String,
  },
  resourceId: {
    type: String,
  },
  previousValue: {
    type: Schema.Types.Mixed,
  },
  newValue: {
    type: Schema.Types.Mixed,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
  success: {
    type: Boolean,
    required: true,
  },
  errorMessage: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
})

auditLogSchema.index({ action: 1, timestamp: -1 })
auditLogSchema.index({ userId: 1, timestamp: -1 })

auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema)

export default AuditLog

export const createAuditLog = async (
  action: AuditAction,
  user: { _id: string; email: string } | null,
  req: any,
  options: {
    resourceType?: string
    resourceId?: string
    previousValue?: Record<string, unknown>
    newValue?: Record<string, unknown>
    metadata?: Record<string, unknown>
    success?: boolean
    errorMessage?: string
  } = {}
): Promise<void> => {
  try {
    await AuditLog.create({
      action,
      userId: user?._id || 'anonymous',
      userEmail: user?.email || 'anonymous',
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      previousValue: options.previousValue,
      newValue: options.newValue,
      metadata: options.metadata,
      success: options.success ?? true,
      errorMessage: options.errorMessage,
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

export const getAuditLogs = async (
  filters: {
    action?: AuditAction
    userId?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    skip?: number
  } = {}
): Promise<{ logs: any[]; total: number }> => {
  const query: any = {}

  if (filters.action) {
    query.action = filters.action
  }

  if (filters.userId) {
    query.userId = filters.userId
  }

  if (filters.startDate || filters.endDate) {
    query.timestamp = {}
    if (filters.startDate) {
      query.timestamp.$gte = filters.startDate
    }
    if (filters.endDate) {
      query.timestamp.$lte = filters.endDate
    }
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(filters.skip || 0)
      .limit(filters.limit || 50)
      .lean(),
    AuditLog.countDocuments(query),
  ])

  return { logs, total }
}
