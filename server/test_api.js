const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

// Test 1: Health Check
console.log('[Test Server] Testing /api/health...');
fetch('http://localhost:3001/api/health')
    .then(res => {
        console.log('✓ Health check:', res.ok ? 'PASS' : 'FAIL');
        return res.text();
    })
    .then(body => console.log('  Response:', body))
    .catch(err => console.error('✗ Health check failed:', err.message));

// Test 2: Create Session
setTimeout(() => {
    console.log('\n[Test Server] Testing /api/sessions POST...');
    fetch('http://localhost:3001/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'test-user', caseId: 'test-session-case' })
    })
        .then(res => res.json())
        .then(data => {
            console.log('✓ Session creation:', data._id ? 'PASS' : 'FAIL');
            console.log('  Session ID:', data._id || data.id);

            // Test 3: Chat without TTS (V1 Engine)
            setTimeout(() => testChatV1(data._id || data.id), 1000);
        })
        .catch(err => console.error('✗ Session creation failed:', err.message));
}, 1000);

function testChatV1(sessionId) {
    console.log('\n[Test Server] Testing /api/chat with V1 (No TTS)...');
    fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId,
            caseId: 'test-session-case',
            newMessage: 'Hello, how are you feeling?',
            history: [],
            engine: 'v1'
        })
    })
        .then(res => res.json())
        .then(data => {
            console.log('✓ Chat V1:', data.text ? 'PASS' : 'FAIL');
            console.log('  Response:', data.text?.substring(0, 100));

            // Test 4: Disable TTS and test V2
            setTimeout(() => testChatV2WithoutTTS(sessionId), 1000);
        })
        .catch(err => console.error('✗ Chat V1 failed:', err.message));
}

function testChatV2WithoutTTS(sessionId) {
    console.log('\n[Test Server] Testing /api/chat with V2 (TTS Logic Disabled)...');
    console.log('  This will test the MCP layer without TTS synthesis');

    // We'll temporarily disable TTS by using V1
    fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId,
            caseId: 'test-session-case',
            newMessage: 'Do you have any pain?',
            history: [],
            engine: 'v2'
        })
    })
        .then(async res => {
            const contentType = res.headers.get('content-type');
            console.log('  Response Content-Type:', contentType);

            if (contentType?.includes('audio')) {
                console.log('✓ Chat V2: Got audio response');
                const buffer = await res.arrayBuffer();
                console.log('  Audio size:', buffer.byteLength, 'bytes');

                const transcript = res.headers.get('X-Transcript');
                console.log('  Transcript:', transcript ? decodeURIComponent(transcript) : 'N/A');
            } else {
                const data = await res.json();
                console.log(res.ok ? '✓ Chat V2: PASS (JSON)' : '✗ Chat V2: FAIL');
                console.log('  Response:', JSON.stringify(data).substring(0, 200));
            }

            setTimeout(() => {
                console.log('\n[Test Server] All tests complete. Exiting...');
                process.exit(0);
            }, 1000);
        })
        .catch(err => {
            console.error('✗ Chat V2 failed:', err.message);
            process.exit(1);
        });
}
