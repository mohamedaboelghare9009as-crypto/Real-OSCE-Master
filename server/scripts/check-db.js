
const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
    console.log('--- MONGODB CONNECTIVITY & DATA CHECK ---');
    console.log(`URI: ${process.env.MONGO_URI?.substring(0, 30)}...`);

    try {
        console.log('\n[1] Attempting connection...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            family: 4
        });
        console.log('✅ Connected successfully!');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n[2] Collections found:', collections.map(c => c.name).join(', '));

        const Case = mongoose.connection.db.collection('cases');
        const count = await Case.countDocuments();
        console.log(`\n[3] Total Cases in "cases" collection: ${count}`);

        if (count > 0) {
            console.log('\n[4] Sampling first 3 cases:');
            const samples = await Case.find({}).limit(3).toArray();
            samples.forEach((c, i) => {
                const title = c.case_metadata?.title || c.metadata?.title || "Untitled";
                const type = c.case_metadata ? "V2" : "V1";
                console.log(`   ${i + 1}. ${title} (${type}) - ID: ${c._id}`);
            });
        } else {
            console.log('\n⚠️ The library is empty. Have you run the seed script?');
        }

    } catch (error) {
        console.error('\n❌ DATABASE ERROR!');
        console.error('Message:', error.message);
        console.error('Code:', error.code);

        if (error.message.includes('authentication failed')) {
            console.error('\nPOSSIBLE CAUSES:');
            console.error('1. Wrong username or password in MONGO_URI.');
            console.error('2. Special characters in password not URL-encoded.');
            console.error('3. IP address not whitelisted in MongoDB Atlas.');
        }
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkDatabase();
