import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { SpeechClient } from '@google-cloud/speech';
import { simulationEngine } from '../engine/SimulationEngine';
import { ttsService } from './ttsService';
import { geminiLiveService } from './geminiLiveService';
import { caseService } from './caseService';
import { voiceDecorator } from '../voice/voiceDecorator';
import { smartSynthesize, smartSynthesizeStream } from '../voice/smartTTSDispatcher';
import WebSocket from 'ws';
import { sessionCacheService } from './sessionCacheService';

export class SocketService {
    private io: SocketIOServer;
    private speechClient: SpeechClient;
    private liveSessions: Map<string, WebSocket> = new Map();

    constructor(server: HttpServer) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: [process.env.FRONTEND_URL || 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3000'],
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        this.speechClient = new SpeechClient();
        this.initialize();
    }

    private async handleFinalInput(socket: Socket, text: string, caseId: string = 'default', sessionId: string = 'default') {
        if ((socket as any).isProcessing) return;
        (socket as any).isProcessing = true;

        try {
            const finalSessionId = sessionId === 'default' ? `socket-${socket.id}` : sessionId;
            const caseData = await caseService.getCaseById(caseId, finalSessionId);

            // INSTANT FEEDBACK: Let user know we're processing (eliminates perceived delay)
            socket.emit('ai-thinking', { isThinking: true });

            console.log(`\n--- [PROGRESSIVE TTS START] ---`);
            const stream = simulationEngine.processStream(text, 'socket-user', caseId, finalSessionId);

            let fullText = "";
            let sentenceBuffer = "";
            let responseMeta: any = {};

            // ENABLED: Character-based chunking for consistent performance
            // Using fixed 125-char chunks (optimized from testing - 37.7% faster than 100)
            const ENABLE_PROGRESSIVE_CHUNKING = true;
            const CHUNK_SIZE = 125; // Characters per chunk (optimal balance of speed vs API calls)
            const ENABLE_PARALLEL_SYNTHESIS = false; // DISABLED: Sequential is faster due to API rate limiting

            // Collect all chunks during streaming for parallel synthesis
            const collectedChunks: string[] = [];

            // Stream text chunks in real-time (transcript-style)
            for await (const chunk of stream) {
                if (chunk.textChunk) {
                    fullText += chunk.textChunk;
                    sentenceBuffer += chunk.textChunk;

                    // Emit text chunk immediately for real-time transcript display
                    socket.emit('ai-response-text-chunk', chunk.textChunk);

                    // Collect chunks for processing after text streaming completes
                    if (ENABLE_PROGRESSIVE_CHUNKING) {
                        while (sentenceBuffer.length >= CHUNK_SIZE) {
                            const textChunk = sentenceBuffer.substring(0, CHUNK_SIZE);
                            sentenceBuffer = sentenceBuffer.substring(CHUNK_SIZE);
                            collectedChunks.push(textChunk);
                        }
                    }
                }

                if (chunk.fullSentence) {
                    fullText += chunk.fullSentence;
                    sentenceBuffer += chunk.fullSentence;
                    socket.emit('ai-response-text-chunk', chunk.fullSentence);

                    if (ENABLE_PROGRESSIVE_CHUNKING) {
                        while (sentenceBuffer.length >= CHUNK_SIZE) {
                            const textChunk = sentenceBuffer.substring(0, CHUNK_SIZE);
                            sentenceBuffer = sentenceBuffer.substring(CHUNK_SIZE);
                            collectedChunks.push(textChunk);
                        }
                    }
                }

                if (chunk.meta) {
                    responseMeta = { ...responseMeta, ...chunk.meta };
                }
            }


            // Add final chunk if text remains (work for both modes)
            if (ENABLE_PROGRESSIVE_CHUNKING && sentenceBuffer.trim()) {
                collectedChunks.push(sentenceBuffer.trim());
                sentenceBuffer = ""; // Clear buffer after adding to avoid double processing
            }

            // console.log(`[TTS-DEBUG] Text streaming complete. Collected ${collectedChunks.length} chunks`);
            // console.log(`[TTS-DEBUG] ENABLE_PARALLEL_SYNTHESIS = ${ENABLE_PARALLEL_SYNTHESIS}`);
            // console.log(`[TTS-DEBUG] Full text length: ${fullText.length} chars`);

            // SEQUENTIAL SYNTHESIS: Process chunks one by one (default - no rate limiting issues)
            if (ENABLE_PROGRESSIVE_CHUNKING && !ENABLE_PARALLEL_SYNTHESIS && collectedChunks.length > 0) {
                console.log(`[SEQUENTIAL-TTS] 🎯 Processing ${collectedChunks.length} chunks sequentially`);
                const seqStart = Date.now();

                for (let i = 0; i < collectedChunks.length; i++) {
                    const textChunk = collectedChunks[i];
                    const chunkIndex = i + 1;
                    console.log(`[SEQUENTIAL-TTS] Chunk ${chunkIndex}/${collectedChunks.length}: "${textChunk.substring(0, 30)}..." (${textChunk.length} chars)`);

                    try {
                        await this.processSentenceAudioProgressive(socket, textChunk, caseData, responseMeta, chunkIndex);
                    } catch (e: any) {
                        console.error(`[SEQUENTIAL-TTS] Error on chunk ${chunkIndex}:`, e.message);
                    }
                }

                const totalTime = Date.now() - seqStart;
                const avgTime = (totalTime / collectedChunks.length).toFixed(0);
                console.log(`[SEQUENTIAL-TTS] ✅ All ${collectedChunks.length} chunks completed in ${totalTime}ms (avg: ${avgTime}ms/chunk)`);
            } else if (ENABLE_PROGRESSIVE_CHUNKING && !ENABLE_PARALLEL_SYNTHESIS) {
                console.log(`[TTS-DEBUG] ⚠️ No chunks to process! collectedChunks.length = ${collectedChunks.length}`);
            }

            // PARALLEL SYNTHESIS: Fire all TTS requests simultaneously (DISABLED - causes rate limiting)
            if (ENABLE_PROGRESSIVE_CHUNKING && ENABLE_PARALLEL_SYNTHESIS && collectedChunks.length > 0) {
                console.log(`[PARALLEL-TTS] 🚀 Firing ${collectedChunks.length} parallel TTS requests`);
                const parallelStart = Date.now();

                const synthesisPromises = collectedChunks.map((textChunk, index) => {
                    const chunkIndex = index + 1;
                    console.log(`[PARALLEL-TTS] Chunk ${chunkIndex}/${collectedChunks.length}: "${textChunk.substring(0, 30)}..." (${textChunk.length} chars)`);
                    return this.processSentenceAudioProgressive(socket, textChunk, caseData, responseMeta, chunkIndex);
                });

                // Wait for all to complete
                await Promise.allSettled(synthesisPromises);

                const totalTime = Date.now() - parallelStart;
                const avgTime = (totalTime / collectedChunks.length).toFixed(0);
                console.log(`[PARALLEL-TTS] ✅ All ${collectedChunks.length} chunks completed in ${totalTime}ms (avg: ${avgTime}ms/chunk)`);
            }

            // ONE-SHOT SYNTHESIS: Only if chunking/parallel is disabled
            if (!ENABLE_PROGRESSIVE_CHUNKING && fullText.trim()) {
                console.log(`[ONE-SHOT-TTS] Generating audio for full response (${fullText.length} chars)`);
                try {
                    const audioResult = await smartSynthesize(fullText, caseData, {
                        isNurse: responseMeta?.isNurse
                    });

                    socket.emit('ai-audio-complete', {
                        audio: audioResult.audioDataUrl,
                        voiceInfo: audioResult.voiceInfo
                    });

                    console.log(`[ONE-SHOT-TTS] Audio generated successfully`);
                } catch (e: any) {
                    console.error(`[ONE-SHOT-TTS] Error:`, e.message);
                }
            }

            // Emit the full text for UI bubble display
            socket.emit('ai-response-text', { text: fullText, meta: responseMeta });

            // Final Metadata & State Updates (sent immediately, not waiting for audio)
            socket.emit('ai-response-final', {
                fullText,
                meta: responseMeta
            });

            if (responseMeta.updatedState) {
                socket.emit('state-update', responseMeta.updatedState);
            }

            // Stop thinking indicator
            socket.emit('ai-thinking', { isThinking: false });

            const totalChunks = collectedChunks.length + (sentenceBuffer.trim() ? 1 : 0);
            console.log(`--- [PROGRESSIVE TTS END] (${totalChunks} chunks queued) ---`);


        } catch (error: any) {
            console.error(`[Socket] Stream Error:`, error.message);
            socket.emit('ai-error', { message: "Something went wrong in the streaming engine." });
        } finally {
            (socket as any).isProcessing = false;
        }
    }

    /**
     * Process audio for a single chunk PROGRESSIVELY (as chunks complete)
     * Emits audio immediately for instant playback
     */
    private async processSentenceAudioProgressive(socket: Socket, sentence: string, caseData: any, meta: any, sentenceIndex: number) {
        if (!sentence.trim()) return;

        const chunkStartTime = Date.now();
        console.log(`[PROGRESSIVE-TTS] 🎙️ Starting STREAMING synthesis for chunk ${sentenceIndex} (${sentence.length} chars)`);

        try {
            const synthesisStart = Date.now();
            let ttfb: number | null = null;
            let totalChunks = 0;

            // Use smartSynthesize to get the stream
            const audioResult = await smartSynthesize(sentence, caseData, {
                isNurse: meta?.isNurse
            });

            // Log synthesis completion
            const synthesisTime = Date.now() - synthesisStart;
            console.log(`[PROGRESSIVE-TTS] ✅ Synthesis complete for chunk ${sentenceIndex} in ${synthesisTime}ms`);

            // Emit the complete audio
            socket.emit('ai-audio-chunk', {
                audio: audioResult.audioDataUrl,
                sentenceIndex,
                voiceInfo: audioResult.voiceInfo
            });

            const totalTime = Date.now() - chunkStartTime;
            console.log(`[PROGRESSIVE-TTS] 📤 Chunk ${sentenceIndex} emitted (total: ${totalTime}ms)`);

        } catch (e: any) {
            console.error(`[PROGRESSIVE-TTS] ❌ Error for chunk ${sentenceIndex}:`, e.message);
        }
    }

    private initialize() {
        this.io.on('connection', (socket: Socket) => {
            console.log(`[Socket] Client connected: ${socket.id}`);

            let recognizeStream: any = null;

            socket.on('start-stream', () => {
                console.log(`[Socket] Starting Audio Stream for ${socket.id}`);

                recognizeStream = this.speechClient
                    .streamingRecognize({
                        config: {
                            encoding: 'WEBM_OPUS',
                            sampleRateHertz: 48000,
                            languageCode: 'en-US',
                            enableAutomaticPunctuation: true,
                        },
                        interimResults: true,
                    })
                    .on('error', (err: any) => {
                        console.error('[Socket] STT Error:', err);
                        socket.emit('error', 'Speech recognition error');
                    })
                    .on('data', (data: any) => {
                        if (data.results[0] && data.results[0].alternatives[0]) {
                            const transcript = data.results[0].alternatives[0].transcript;
                            const isFinal = data.results[0].isFinal;

                            if ((socket as any).isProcessing) return;

                            socket.emit('transcript', { text: transcript, isFinal });

                            if (isFinal) {
                                this.handleFinalInput(socket, transcript);
                            }
                        }
                    });
            });

            socket.on('audio-chunk', (chunk: any) => {
                if (recognizeStream) {
                    recognizeStream.write(chunk);
                }
            });

            socket.on('join-session', async (sessionId: string) => {
                socket.join(sessionId);
                console.log(`[Socket] Client ${socket.id} joined session room: ${sessionId}`);

                try {
                    let state = sessionCacheService.get(sessionId);

                    if (!state) {
                        const { StateManager } = await import('../engine/core/StateManager');
                        const stateManager = new StateManager();
                        await stateManager.loadSession('recovery', 'recovery', sessionId);
                        state = sessionCacheService.get(sessionId);
                    }

                    if (state) {
                        if (state.transcript && state.transcript.length > 0) {
                            state.transcript.forEach(msg => {
                                socket.emit('ai-response-text', {
                                    text: msg.text,
                                    meta: {
                                        role: msg.role === 'user' ? 'user' : 'model',
                                        isHistory: true,
                                        timestamp: msg.timestamp
                                    }
                                });
                            });
                        }

                        socket.emit('state-update', {
                            sessionId,
                            currentStage: state.currentStage,
                            vitals: state.dynamicData?.vitals,
                            physicalExamFindings: state.dynamicData?.investigations?.filter(i => (i as any).type === 'finding'),
                            investigationResults: state.dynamicData?.investigations?.filter(i => (i as any).type === 'investigation'),
                            isRecovery: true
                        });
                    }
                } catch (e) {
                    console.error("[Socket] State recovery failed:", e);
                }
            });

            socket.on('stop-stream', () => {
                if (recognizeStream) {
                    recognizeStream.end();
                    recognizeStream = null;
                }
            });

            socket.on('message', async (data: { text: string, caseId: string, sessionId: string, target?: 'Nurse' | 'Patient', stage?: string }) => {
                console.log(`[Socket] Received message from ${socket.id}: "${data.text}"`);
                const finalSessionId = data.sessionId === 'default' ? `socket-${socket.id}` : data.sessionId;
                if (data.stage) {
                    sessionCacheService.update(finalSessionId, { currentStage: data.stage });
                }
                const isNurse = data.target === 'Nurse' || data.text.toLowerCase().includes('nurse');
                console.log(`[Socket] Handling clinical state for ${finalSessionId}...`);
                await this.handleClinicalState(socket, finalSessionId, data.caseId || 'default', data.text, isNurse, data.stage);
                console.log(`[Socket] Triggering handleFinalInput for ${finalSessionId}...`);
                await this.handleFinalInput(socket, data.text, data.caseId, data.sessionId);
            });

            socket.on('stage-sync', async (data: { sessionId: string, stage: string }) => {
                sessionCacheService.update(data.sessionId, { currentStage: data.stage, lastInteraction: new Date() });
            });

            socket.on('reset-session', async (data: { caseId: string, sessionId: string }) => {
                (socket as any).isProcessing = false;
                const finalSessionId = data.sessionId === 'default' ? `socket-${socket.id}` : data.sessionId;
                await simulationEngine.reset(finalSessionId);
                socket.emit('session-reset-complete');
            });

            socket.on('disconnect', () => {
                if (recognizeStream) recognizeStream.end();
            });
        });
    }

    private async handleClinicalState(socket: Socket, sessionId: string, caseId: string, text: string, isNurse: boolean, stage?: string) {
        const lowerText = text.toLowerCase();
        try {
            const caseData = await caseService.getCaseById(caseId, sessionId) as any;
            if (!caseData) return;

            if (isNurse && (lowerText.includes('vitals') || lowerText.includes('vital') || lowerText.includes('check'))) {
                const vitals = this.extractVitals(caseData);
                if (vitals) {
                    const state = sessionCacheService.get(sessionId);
                    if (state) sessionCacheService.update(sessionId, { dynamicData: { ...state.dynamicData, vitals } });
                    this.io.to(sessionId).emit('state-update', { sessionId, vitals, lastInteraction: new Date() });
                }
            }

            if (lowerText.includes('exam') || lowerText.includes('examine') || lowerText.includes('look') ||
                lowerText.includes('cvs') || lowerText.includes('resp') || lowerText.includes('abd')) {
                const examFinding = this.findExamFinding(caseData, lowerText);
                if (examFinding) {
                    const state = sessionCacheService.get(sessionId);
                    if (state) {
                        const investigations = state.dynamicData?.investigations || [];
                        if (!investigations.find(i => i.type === 'finding' && i.system === examFinding.system)) {
                            investigations.push({ ...examFinding, type: 'finding', timestamp: new Date() });
                            sessionCacheService.update(sessionId, { dynamicData: { ...state.dynamicData, investigations } });
                        }
                    }
                    this.io.to(sessionId).emit('state-update', { sessionId, physicalExamFindings: [examFinding], lastInteraction: new Date() });
                }
            }

            if (isNurse && (lowerText.includes('order') || lowerText.includes('ecg') || lowerText.includes('blood'))) {
                const investigation = this.findInvestigation(caseData, lowerText);
                if (investigation) {
                    const state = sessionCacheService.get(sessionId);
                    if (state) {
                        const investigations = state.dynamicData?.investigations || [];
                        if (!investigations.find(i => i.type === 'investigation' && i.test === investigation.test)) {
                            investigations.push({ ...investigation, type: 'investigation', timestamp: new Date() });
                            sessionCacheService.update(sessionId, { dynamicData: { ...state.dynamicData, investigations } });
                        }
                    }
                    this.io.to(sessionId).emit('state-update', { sessionId, investigationResults: [investigation], lastInteraction: new Date() });
                }
            }
        } catch (error) {
            console.error(`[Socket] Clinical State Error:`, error);
        }
    }

    private extractVitals(caseData: any): any | null {
        const v = caseData?.truth?.physical_exam?.vitals || caseData?.examination?.vitals;
        if (!v) return null;
        const bpParts = (v.bp || "120/80").split('/');
        return { hr: v.hr || 80, sbp: parseInt(bpParts[0]) || 120, dbp: parseInt(bpParts[1]) || 80, rr: v.rr || 16, spo2: v.spo2 || 98, temp: v.temp || 37.0 };
    }

    private findExamFinding(caseData: any, query: string): any | null {
        if (caseData?.truth?.physical_exam) {
            const pe = caseData.truth.physical_exam;
            for (const [system, finding] of Object.entries(pe)) {
                if (system === 'vitals' || typeof finding !== 'string') continue;
                if (query.includes(system.toLowerCase()) ||
                    (system === 'cardiovascular' && query.includes('cvs')) ||
                    (system === 'respiratory' && query.includes('resp')) ||
                    (system === 'abdomen' && query.includes('abd'))) {
                    return { system: system.charAt(0).toUpperCase() + system.slice(1), finding };
                }
            }
        }
        return null;
    }

    private findInvestigation(caseData: any, query: string): any | null {
        const inv = caseData?.truth?.investigations;
        if (!inv) return null;
        const check = (cat: any, label: string) => {
            if (!cat) return null;
            for (const [test, result] of Object.entries(cat)) {
                if (query.includes(test.toLowerCase())) return { test: test.charAt(0).toUpperCase() + test.slice(1), result, category: label };
            }
            return null;
        };
        return check(inv.bedside, 'Bedside') || check(inv.confirmatory, 'Confirmatory');
    }
}
