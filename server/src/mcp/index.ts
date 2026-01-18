import { ContextBuilder } from './context/contextBuilder';
import { PolicyEngine } from './policies/policyEngine';
import { McpToolsDefinition } from './tools/toolDefinitions';
import { McpResponse } from './schemas/mcpSchema';
import { ScoringEngine } from './scoring/engine';
import { OsceCase } from '../schemas/caseSchema';
import { SessionState } from '../schemas/sessionSchema';
import { sessionService } from '../services/sessionService';
import { caseService } from '../services/caseService';

export class OSCE_MCP {
    private contextBuilder: ContextBuilder;
    private policyEngine: PolicyEngine;

    constructor() {
        this.contextBuilder = new ContextBuilder();
        this.policyEngine = new PolicyEngine();
    }

    async processUserRequest(userId: string, caseId: string, userMessage: string, sessionId?: string): Promise<McpResponse> {
        // 1. Pre-Check
        const isRequestValid = await this.policyEngine.validateRequest(userId, caseId, userMessage, sessionId);
        if (!isRequestValid) {
            console.warn(`[MCP] Request validation failed for User: ${userId}, Case: ${caseId}`);
            return { content: "Invalid request or session state.", tool_calls: [] };
        }

        // 2. Build Safe Context
        const context = await this.contextBuilder.buildContext(caseId, userId);

        // 3. Call Model (Mock for now)
        let rawResponse: McpResponse;

        if (caseId === 'mock-case-001') {
            rawResponse = await this.mockCaseHeuristic(userMessage, context);
        } else {
            rawResponse = await this.mockModelCall(context, userMessage);
        }

        // --- SCORING INTEGRATION ---
        if (sessionId && rawResponse.tool_calls && rawResponse.tool_calls.length > 0) {
            const tool = rawResponse.tool_calls[0];
            // Heuristic Map: If model calls "reveal_info", we treat it as successfully asking for that info.
            if (tool.name === 'reveal_info') {
                try {
                    const session = await sessionService.getSession(sessionId);
                    const caseContent = await caseService.getCaseById(caseId);

                    if (session && caseContent) {
                        // Action Name: For HPI, usually "Ask about <symptom>".
                        // In this mock, we infer from content or message.
                        // Let's use the USER MESSAGE as the proxy for action "Asked about X"
                        // Or use the tool content. 
                        // "reveal_info" with content "Sharp right sided chest pain." matches "onset of pain" or similar?
                        // Ideally we pass "userMessage" as the action to see if it matches.

                        const result = await ScoringEngine.evaluateAction(
                            caseContent as OsceCase,
                            session as SessionState,
                            tool.arguments.topic || userMessage,
                            session.currentStage
                        );

                        session.scoreTotal = result.pointsTotal;
                        result.criticalFlags.forEach(f => {
                            if (!session.criticalFlags.includes(f)) session.criticalFlags.push(f);
                        });
                        session.actionsTaken.push({
                            action: userMessage,
                            stage: session.currentStage,
                            pointsAwarded: result.pointsAwarded,
                            timestamp: new Date(),
                            details: tool.arguments
                        });
                        session.lastInteraction = new Date();

                        await sessionService.updateSession(sessionId, {
                            scoreTotal: session.scoreTotal,
                            criticalFlags: session.criticalFlags,
                            actionsTaken: session.actionsTaken,
                            lastInteraction: session.lastInteraction
                        });

                        console.log(`[Scoring] Action: "${userMessage}", Points: ${result.pointsAwarded}, Total: ${session.scoreTotal}`);
                    }
                } catch (err) {
                    console.error("Scoring Error:", err);
                }
            }
        }
        // ---------------------------

        // 4. Get Current Stage for Post-Check
        const sessionCheck = await sessionService.findActiveSession(userId, caseId);
        const currentStage = sessionCheck?.currentStage || 'History';

        // 5. Post-Check
        const safeResponse = await this.policyEngine.validateResponse(rawResponse, currentStage);

        return safeResponse;
    }

    // Real Model Call to Google Vertex AI
    private async mockModelCall(systemContext: string, userMessage: string): Promise<McpResponse> {
        try {
            const { VertexAI } = require('@google-cloud/vertexai');

            // Initialize Vertex AI
            // Project ID and Location should ideally be in env, but we can default or extract from JSON if needed.
            // Using 'us-central1' as default.
            const vertex_ai = new VertexAI({ project: 'osce-ai-sim', location: 'us-central1' });
            const model = 'gemini-1.5-flash-001';

            // Instantiate the generative model
            const generativeModel = vertex_ai.getGenerativeModel({
                model: model,
                systemInstruction: {
                    parts: [{ text: systemContext }]
                },
                generationConfig: {
                    responseMimeType: "application/json"
                }
            });

            const prompt = `
${userMessage}

RESPONSE FORMAT:
You must respond with a JSON object strictly matching this schema:
{
  "content": "string or null (the text response to the user)",
  "tool_calls": [
    { "name": "tool_name", "arguments": { "arg1": "value" } }
  ]
}

Available Tools:
${JSON.stringify(McpToolsDefinition, null, 2)}
`;

            const resp = await generativeModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });

            const responseText = resp.response.candidates[0].content.parts[0].text;
            console.log("[MCP] Vertex AI Response:", responseText);

            try {
                const parsed = JSON.parse(responseText);
                return parsed as McpResponse;
            } catch (e) {
                return { content: responseText, tool_calls: [] };
            }

        } catch (error: any) {
            console.error("Vertex AI API Error:", error);
            return {
                content: "I'm having trouble thinking right now. (Vertex AI Error)",
                tool_calls: []
            };
        }
    }

    async mockCaseHeuristic(userMessage: string, context: string): Promise<McpResponse> {
        // Simple keyword matching for the mock case
        const msg = userMessage.toLowerCase();

        if (msg.includes('pain') || msg.includes('hurt') || msg.includes('feeling')) {
            return {
                content: "The pain is really bad, about an 8 out of 10. It feels like a heavy weight on my chest.",
                tool_calls: [{ name: 'reveal_info', arguments: { topic: 'Asked about onset of pain' } }]
            };
        }

        if (msg.includes('where') || msg.includes('radiation') || msg.includes('jaw') || msg.includes('arm')) {
            return {
                content: "It goes down my left arm and up into my jaw. It's terrifying.",
                tool_calls: [{ name: 'reveal_info', arguments: { topic: 'radiation' } }]
            };
        }

        if (msg.includes('breath') || msg.includes('breathing')) {
            return {
                content: "I feel a bit short of breath, probably because of the pain.",
                tool_calls: [{ name: 'reveal_info', arguments: { topic: 'associated symptoms - dyspnea' } }]
            };
        }

        if (msg.includes('sweat') || msg.includes('nausea') || msg.includes('sick')) {
            return {
                content: "Yes, I feel nauseous and I'm sweating a lot.",
                tool_calls: [{ name: 'reveal_info', arguments: { topic: 'associated symptoms - autonomic' } }]
            };
        }

        if (msg.includes('hello') || msg.includes('hi') || msg.includes('morning')) {
            return {
                content: "Doctor, please help me, I have this terrible chest pain.",
                tool_calls: []
            };
        }

        return {
            content: "I'm just in so much pain, please do something.",
            tool_calls: []
        };
    }

    getToolDefinitions() {
        return McpToolsDefinition;
    }
}

export const mcpLayer = new OSCE_MCP();
