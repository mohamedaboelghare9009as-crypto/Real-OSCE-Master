import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  avatar?: string;
  specialty: string;
  bio?: string;
  experience?: string;
  rating?: number;
  consultationCount?: number;
  languages?: string[];
  education?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const DoctorSchema: Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  specialty: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  consultationCount: {
    type: Number,
    default: 0
  },
  languages: [{
    type: String
  }],
  education: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);