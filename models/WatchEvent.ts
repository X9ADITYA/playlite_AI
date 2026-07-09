import { model, models, Schema, type Model } from 'mongoose';

export interface WatchEventRecord {
  userId: Schema.Types.ObjectId | string;
  videoId: Schema.Types.ObjectId | string;
  watchedSeconds: number;
  lastPosition: number;
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const WatchEventSchema = new Schema<WatchEventRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true, index: true },
    watchedSeconds: { type: Number, default: 0 },
    lastPosition: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

WatchEventSchema.index({ userId: 1, videoId: 1 }, { unique: true });

const WatchEvent = (models.WatchEvent as Model<WatchEventRecord>) || model<WatchEventRecord>('WatchEvent', WatchEventSchema);

export default WatchEvent;