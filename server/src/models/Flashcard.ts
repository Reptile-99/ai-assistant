import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashcard extends Document {
  userId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  deckName: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mastered: boolean;
  createdAt: Date;
}

const flashcardSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  deckName: {
    type: String,
    required: true
  },
  front: {
    type: String,
    required: [true, 'Flashcard must have a front/question']
  },
  back: {
    type: String,
    required: [true, 'Flashcard must have a back/answer']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  mastered: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.Flashcard || mongoose.model<IFlashcard>('Flashcard', flashcardSchema);
