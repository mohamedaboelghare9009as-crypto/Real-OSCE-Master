import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
    _id: string;
    email: string;
    password: string;
    fullName: string;
    role: string;
    plan: string;
    googleAccessToken?: string;
    googleRefreshToken?: string;
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    fullName: { type: String, default: '' },
    role: { type: String, default: 'Student' },
    plan: { type: String, default: 'Free' },
    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
