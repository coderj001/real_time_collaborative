import mongoose, { Document, Schema } from 'mongoose'

export interface ISession extends Document {
  _id: string
  name: string
  shareCode: string
  createdBy: string
  createdAt: Date
  snapshot: { objects: Record<string, unknown>[] }
  lastSavedAt: Date
}

const SessionSchema = new Schema<ISession>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    shareCode: { type: String, required: true, unique: true },
    createdBy: { type: String, required: true },
    snapshot: {
      objects: { type: Schema.Types.Mixed, default: [] },
    },
    lastSavedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false }, _id: false }
)

export const Session = mongoose.model<ISession>('Session', SessionSchema)
