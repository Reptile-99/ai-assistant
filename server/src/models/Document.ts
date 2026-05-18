import mongoose, { Schema, Document } from 'mongoose';

export interface SummaryCacheEntry {
  content: string;
  generatedAt: Date;
  tokenUsage: number;
}

export interface IDocument extends Document {
  title: string;
  userId: mongoose.Types.ObjectId;
  fileUrl: string;
  content: string;
  fileSize: number;
  pageCount: number;
  summaries?: Map<string, SummaryCacheEntry>;
  isIndexed: boolean;
  chunkCount: number;
  indexedAt?: Date;
  createdAt: Date;
}

const documentSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  pageCount: {
    type: Number,
    required: true
  },
  summaries: {
    type: Map,
    of: new Schema(
      {
        content: { type: String, required: true },
        generatedAt: { type: Date, default: Date.now },
        tokenUsage: { type: Number, default: 0 },
      },
      { _id: false }
    ),
    default: {},
  },
  isIndexed: {
    type: Boolean,
    default: false
  },
  chunkCount: {
    type: Number,
    default: 0
  },
  indexedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.Document || mongoose.model<IDocument>('Document', documentSchema);
