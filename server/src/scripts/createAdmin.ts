
import mongoose from 'mongoose';
import { User } from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("No MONGO_URI found.");
    process.exit(1);
}

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const email = 'admin@osce.com';
        const rawPassword = 'password123';

        // 1. Delete
        await User.deleteOne({ email });

        // 2. Create
        console.log("Creating new user...");
        const user = new User({
            email,
            password: rawPassword,
            fullName: 'OSCE Admin',
            role: 'admin',
            plan: 'Pro'
        });
        await user.save();
        console.log(`User saved.`);

        // 3. Verify immediately
        const fetchedUser = await User.findOne({ email });
        if (!fetchedUser) {
            console.error("CRITICAL: User not found after save!");
            process.exit(1);
        }

        console.log(`Fetched User ID: ${fetchedUser._id}`);
        console.log(`Stored Hash: ${fetchedUser.password}`);

        const isMatch = await fetchedUser.comparePassword(rawPassword);
        console.log(`Self-Check Result: Password Match = ${isMatch}`);

        if (isMatch) {
            console.log("SUCCESS: User created and password verifies correctly.");
        } else {
            console.error("FAILURE: Password match failed immediately after creation.");
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
