
const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config();

// Manually set credentials for the test script
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'd:\\sound effects\\Real OSCE Master - Copy\\osce-ai-sim-d5b457979ae1.json';

// Standardize paths and vars
const project = process.env.GOOGLE_CLOUD_PROJECT || 'osce-ai-sim';
const location = 'us-central1';
const modelName = 'gemini-2.0-flash-001';

async function testConnection() {
    console.log('--- STARTING VERTEX AI DIRECT CONNECTIVITY TEST ---');
    console.log(`Project: ${project}`);
    console.log(`Location: ${location}`);
    console.log(`Model: ${modelName}`);

    try {
        const vertexAI = new VertexAI({ project, location });
        const model = vertexAI.getGenerativeModel({ model: modelName });

        console.log('\n[1] Attempting simple prompt...');
        const request = {
            contents: [{ role: 'user', parts: [{ text: 'Hello, are you available? Respond with "READY"' }] }],
        };

        const result = await model.generateContent(request);
        const response = await result.response;
        const text = response.candidates?.[0].content.parts[0].text;

        console.log(`\n✅ SUCCESS! AI Response: "${text}"`);

    } catch (error) {
        console.error('\n❌ FAILED!');
        console.error('Error Code:', error.code || 'N/A');
        console.error('Status:', error.status || 'N/A');
        console.error('Message:', error.message);

        if (error.errorDetails) {
            console.error('Details:', JSON.stringify(error.errorDetails, null, 2));
        }

        if (error.message.includes('ENOTFOUND')) {
            console.error('\nDNS ERROR: The machine cannot resolve the Google API hostname. Check internet or region endpoint.');
        } else if (error.message.includes('404')) {
            console.error('\n404 ERROR: Region/Model mismatch. The selected model might not reside in this region.');
        }
    }
}

testConnection();
