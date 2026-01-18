
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Case } from '../models/Case';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const check = async () => {
    try {
        await connectDB();
        const c = await Case.findOne({ "case_metadata.case_id": "PS_MD_001" });
        if (c) {
            console.log("✅ Case Found:", c._id);
            console.log("Title:", (c as any).case_metadata.title);
        } else {
            console.log("❌ Case NOT Found");
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

check();
