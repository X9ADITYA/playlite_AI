import { model, models, Schema, type Model } from 'mongoose';

export interface SummaryTimestamp {
  label: string;
  time: string;
  note: string;
}

export interface QuizOption {
  question: string;
  options?: string[];
  answer: string;
}

export interface LearningQuestion {
  question: string;
  options?: string[];
  answer: string;
}

export interface SummaryRecord {
  shortSummary: string;
  bulletPoints: string[];
  keyTimestamps: SummaryTimestamp[];
}

export interface LearningPack {
  notes: string[];
  quizQuestions: LearningQuestion[];
}

export interface CreatorCopy {
  title: string;
  description: string;
  thumbnailPrompt: string;
}

export interface VideoRecord {
  creatorId: Schema.Types.ObjectId | string;
  title: string;
  description: string;
  tags: string[];
  language: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  storageProvider: 'cloudinary' | 'local';
  storageKey?: string | null;
  durationSeconds: number;
  transcript?: string;
  summary?: SummaryRecord;
  learning?: LearningPack;
  creatorCopy?: CreatorCopy;
  viewCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const TimestampSchema = new Schema<SummaryTimestamp>(
  {
    label: { type: String, required: true },
    time: { type: String, required: true },
    note: { type: String, required: true }
  },
  { _id: false }
);

const QuestionSchema = new Schema<LearningQuestion>(
  {
    question: { type: String, required: true },
    options: { type: [String], default: [] },
    answer: { type: String, required: true }
  },
  { _id: false }
);

const VideoSchema = new Schema<VideoRecord>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    language: { type: String, default: 'en' },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: null },
    storageProvider: { type: String, enum: ['cloudinary', 'local'], default: 'local' },
    storageKey: { type: String, default: null },
    durationSeconds: { type: Number, default: 0 },
    transcript: { type: String, default: '' },
    summary: {
      shortSummary: { type: String, default: '' },
      bulletPoints: { type: [String], default: [] },
      keyTimestamps: { type: [TimestampSchema], default: [] }
    },
    learning: {
      notes: { type: [String], default: [] },
      quizQuestions: { type: [QuestionSchema], default: [] }
    },
    creatorCopy: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      thumbnailPrompt: { type: String, default: '' }
    },
    viewCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Video = (models.Video as Model<VideoRecord>) || model<VideoRecord>('Video', VideoSchema);

export default Video;