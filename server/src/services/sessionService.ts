import { Session } from '../models/Session';
import { SessionState } from '../schemas/sessionSchema';
import { MOCK_CASE_ID } from '../data/mockCase';

const MOCK_SESSION: SessionState = {
  userId: 'mock-user',
  caseId: MOCK_CASE_ID,
  currentStage: 'History',
  isCompleted: false,
  startTime: new Date(),
  lastInteraction: new Date(),
  completedStages: [],
  actionsTaken: [],
  scoreTotal: 0,
  criticalFlags: [],
  failedStage: false,

  // ✅ required by SessionState (per your Render error)
  revealedFacts: [],
  history: []
};

// In-memory mock session storage for runtime (reset on restart)
const mockSessions: Record<string, SessionState> = {};

export class SessionService {
  async getSession(sessionId: string): Promise<SessionState | null> {
    try {
      const session = await Session.findById(sessionId);
      if (session) return session.toObject() as SessionState;
    } catch (error) {
      console.warn(
        `[SessionService] DB Error looking up session ${sessionId}. Using mock if applicable.`
      );
    }

    // Fallback or Mock handling
    if (mockSessions[sessionId]) {
      return mockSessions[sessionId];
    }

    return null;
  }

  async findActiveSession(userId: string, caseId: string): Promise<SessionState | null> {
    try {
      const session = await Session.findOne({ userId, caseId, isCompleted: false });
      if (session) return session.toObject() as SessionState;
    } catch (error) {
      console.warn(`[SessionService] DB Error looking up active session. Using mock.`);
    }

    // Check in-memory mocks
    const mockKey = `${userId}:${caseId}`;
    if (mockSessions[mockKey]) {
      return mockSessions[mockKey];
    }

    // If explicitly requesting the MOCK CASE, permit a fresh mock session
    if (caseId === MOCK_CASE_ID) {
      return {
        ...MOCK_SESSION,
        userId,
        caseId,

        // keep timestamps fresh
        startTime: new Date(),
        lastInteraction: new Date()
      };
    }

    return null;
  }

  async createSession(userId: string, caseId: string): Promise<SessionState> {
    try {
      const session = await Session.create({
        userId,
        caseId,
        currentStage: 'History',
        completedStages: [],
        actionsTaken: [],

        // ✅ include required fields so DB shape matches SessionState
        revealedFacts: [],
        history: [],

        // optional but keeps state consistent
        isCompleted: false,
        scoreTotal: 0,
        criticalFlags: [],
        failedStage: false,
        startTime: new Date(),
        lastInteraction: new Date()
      });

      return session.toObject() as SessionState;
    } catch (error) {
      console.warn(`[SessionService] DB Error creating session. Creating mock session.`);

      // Create Mock
      const newMock: SessionState = {
        userId,
        caseId,
        currentStage: 'History',
        completedStages: [],
        actionsTaken: [],
        scoreTotal: 0,
        criticalFlags: [],
        failedStage: false,
        isCompleted: false,
        startTime: new Date(),
        lastInteraction: new Date(),

        // ✅ required fields
        revealedFacts: [],
        history: []
      };

      // Store simple formatted key
      const mockKey = `${userId}:${caseId}`;
      mockSessions[mockKey] = newMock;

      // Also store by "ID" (we'll generate a fake one)
      const fakeId = `mock-session-${Date.now()}`;

      // attach a fake _id for convenience
      (newMock as any)._id = fakeId;
      mockSessions[fakeId] = newMock;

      return newMock;
    }
  }

  async updateSession(sessionId: string, updates: Partial<SessionState>): Promise<void> {
    // Try DB
    try {
      await Session.findByIdAndUpdate(sessionId, updates);
      return;
    } catch (e) {
      // Provide Mock update
    }

    // Update Mock
    if (mockSessions[sessionId]) {
      Object.assign(mockSessions[sessionId], updates);

      // Also update the lookup key
      const s = mockSessions[sessionId];
      const key = `${s.userId}:${s.caseId}`;
      if (mockSessions[key]) {
        Object.assign(mockSessions[key], updates);
      }
    }
  }
}

export const sessionService = new SessionService();
