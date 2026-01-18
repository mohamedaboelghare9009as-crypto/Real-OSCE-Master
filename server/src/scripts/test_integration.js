
const http = require('http');

function postRequest(message) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            message: message,
            caseId: 'mock-case-001', // Correct ID from mockCase.ts
            userId: 'test-user',
            sessionId: 'test-sess-' + Date.now()
        });

        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        resolve({ text: body }); // Plain text fallback
                    }
                } else {
                    console.log(`Error ${res.statusCode}: ${body}`);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
            resolve(null);
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    console.log("=== INTEGRATION TEST ===");
    const inputs = [
        "When did the pain start?",
        "Do you have any allergies?",
        "Hello",
        "Describe the pain",
        "sdlkfjsdklf" // Should trigger UNCLEAR
    ];

    for (const text of inputs) {
        console.log(`\nINPUT: "${text}"`);
        const result = await postRequest(text);
        if (result) {
            console.log(`OUTPUT: "${result.text || result.message || JSON.stringify(result)}"`);
        }
    }
}

run();
