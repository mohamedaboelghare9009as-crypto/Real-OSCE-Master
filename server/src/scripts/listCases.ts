import mongoose from 'mongoose';
import { Case } from '../models/Case';
import { connectDB } from '../config/db';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const run = async () => {
    await connectDB();
    console.log('Connected');
    const cases = await Case.find({}, 'metadata.title');
    console.log('Cases in DB:', cases.map(c => c.metadata.title));
    await mongoose.disconnect();
};

run();
