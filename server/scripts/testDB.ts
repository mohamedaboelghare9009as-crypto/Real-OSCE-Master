
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const CaseSchema = new mongoose.Schema({}, { strict: false });
const Case = mongoose.model('Case', CaseSchema, 'cases');

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log("Connected to DB");
        const cases = await Case.find({}).limit(5);
        console.log("Found cases:", cases.length);
        cases.forEach(c => {
            console.log("Case ID:", c._id);
            console.log("Keys:", Object.keys(c.toObject()));
            if (c.case_metadata) console.log("Has case_metadata");
            if (c.truth) {
                console.log("Has truth");
                console.log("Truth keys:", Object.keys(c.truth));
            }
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

test();
