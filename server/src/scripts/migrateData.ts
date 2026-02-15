import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Case } from '../models/Case';
import { Session } from '../models/Session';
import { connectDB } from '../config/db';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Use Service Role Key to bypass RLS
const mongoUri = process.env.MONGO_URI || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const migrate = async () => {
    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials (VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
        process.exit(1);
    }
    if (!mongoUri) {
        console.error('Missing MongoDB URI (MONGO_URI)');
        process.exit(1);
    }

    await connectDB();

    console.log('Starting migration...');

    try {
        // Migrate Cases
        console.log('Fetching cases from Supabase...');
        const { data: cases, error: casesError } = await supabase.from('cases').select('*');
        if (casesError) throw casesError;

        if (cases && cases.length > 0) {
            console.log(`Found ${cases.length} cases. Inserting into MongoDB...`);
            await Case.deleteMany({}); // Clear existing to avoid duplicates during dev
            await Case.insertMany(cases);
            console.log('Cases migrated successfully.');
        } else {
            console.log('No cases found in Supabase.');
        }

        // Migrate Sessions
        console.log('Fetching sessions from Supabase...');
        const { data: sessions, error: sessionsError } = await supabase.from('sessions').select('*');
        if (sessionsError) throw sessionsError;

        if (sessions && sessions.length > 0) {
            console.log(`Found ${sessions.length} sessions. Inserting into MongoDB...`);
            await Session.deleteMany({});

            // Transform sessions if necessary (e.g. adjust field names if schema changed)
            // Current schema matches largely.
            await Session.insertMany(sessions);
            console.log('Sessions migrated successfully.');
        } else {
            console.log('No sessions found in Supabase.');
        }

        console.log('Migration completed successfully.');
        process.exit(0);

    } catch (error: any) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
};

migrate();
