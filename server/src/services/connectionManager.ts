import * as https from 'https';
import * as http from 'http';

/**
 * ConnectionManager
 * Singleton to manage persistent HTTP/HTTPS agents for API calls.
 * This enables HTTP Keep-Alive, significantly reducing latency for subsequent calls.
 */
export class ConnectionManager {
    private static instance: ConnectionManager;
    private httpsAgent: https.Agent;
    private httpAgent: http.Agent;

    private constructor() {
        // Configure persistent HTTPS agent
        // Infinity allows for parallel connections during bursts while still reusing them
        this.httpsAgent = new https.Agent({
            keepAlive: true,
            keepAliveMsecs: 10000,
            maxSockets: Infinity,
            maxFreeSockets: 256,
            scheduling: 'lifo'
        });

        // Configure persistent HTTP agent
        this.httpAgent = new http.Agent({
            keepAlive: true,
            keepAliveMsecs: 10000,
            maxSockets: Infinity,
            maxFreeSockets: 256,
            scheduling: 'lifo'
        });

        console.log('[ConnectionManager] Persistent agents initialized (Parallel Keep-Alive)');
    }

    public static getInstance(): ConnectionManager {
        if (!ConnectionManager.instance) {
            ConnectionManager.instance = new ConnectionManager();
        }
        return ConnectionManager.instance;
    }

    public getHttpsAgent(): https.Agent {
        return this.httpsAgent;
    }

    public getHttpAgent(): http.Agent {
        return this.httpAgent;
    }
}

export const connectionManager = ConnectionManager.getInstance();
