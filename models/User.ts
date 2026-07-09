import { model, models, Schema, type Model } from 'mongoose';

export interface UserPreferences {
  topics: string[];
  languages: string[];
  learningGoals: string[];
  maxVideoDurationMinutes?: number;
}

export interface UserRecord {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string | null;
  preferences: UserPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}

const PreferencesSchema = new Schema<UserPreferences>(
  {
    topics: { type: [String], default: [] },
    languages: { type: [String], default: ['en'] },
    learningGoals: { type: [String], default: [] },
    maxVideoDurationMinutes: { type: Number }
  },
  { _id: false }
);

const UserSchema = new Schema<UserRecord>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: null },
    preferences: { type: PreferencesSchema, default: () => ({ topics: [], languages: ['en'], learningGoals: [] }) }
  },
  { timestamps: true }
);

const User = (models.User as Model<UserRecord>) || model<UserRecord>('User', UserSchema);

export default User;