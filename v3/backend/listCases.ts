import mongoose from 'mongoose';
import { Case } from './src/models/Case';

async function list() {
    await mongoose.connect('mongodb://127.0.0.1:27017/osce_master_v3');
    const cases = await Case.find({}, { 'case_metadata.title': 1, 'case_metadata.case_id': 1, 'metadata.title': 1, 'metadata.id': 1 });
    console.log(JSON.stringify(cases, null, 2));
    await mongoose.disconnect();
}

list().catch(console.error);
