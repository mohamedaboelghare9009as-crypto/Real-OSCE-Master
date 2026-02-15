import fs from 'fs';
import path from 'path';

interface VectorDocument {
    id: string;
    caseId: string;
    section: string;
    text: string;
    embedding: number[];
    metadata?: any;
}

export class VectorStoreService {
    private storePath: string;
    private documents: VectorDocument[] = [];

    private initialized = false;

    constructor() {
        this.storePath = path.join(process.cwd(), 'data', 'vector_store.json');
    }

    private async ensureInitialized() {
        if (this.initialized) return;
        this.loadStore();
        this.initialized = true;
    }

    private loadStore() {
        if (fs.existsSync(this.storePath)) {
            try {
                console.log(`[VectorStore] Loading data from ${this.storePath}...`);
                const data = fs.readFileSync(this.storePath, 'utf-8');
                this.documents = JSON.parse(data);
                console.log(`[VectorStore] Loaded ${this.documents.length} documents.`);
            } catch (error) {
                console.error("Failed to load vector store:", error);
                this.documents = [];
            }
        } else {
            // Create empty store
            this.saveStore();
        }
    }

    private saveStore() {
        try {
            // specific check to ensure directory exists, mostly redundant if constructor did its job but good for safety
            const dir = path.dirname(this.storePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.storePath, JSON.stringify(this.documents, null, 2));
        } catch (error) {
            console.error("Failed to save vector store:", error);
        }
    }

    async addDocuments(docs: VectorDocument[]) {
        await this.ensureInitialized();
        this.documents.push(...docs);
        this.saveStore();
        console.log(`[VectorStore] Added ${docs.length} documents. Total: ${this.documents.length}`);
    }

    async similaritySearch(queryEmbedding: number[], k: number = 3, filter?: { caseId?: string }): Promise<VectorDocument[]> {
        await this.ensureInitialized();
        // Simple cosine similarity
        const results = this.documents
            .filter(doc => !filter?.caseId || doc.caseId === filter.caseId)
            .map(doc => ({
                doc,
                score: this.cosineSimilarity(queryEmbedding, doc.embedding)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, k)
            .map(r => r.doc);

        return results;
    }

    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

export const vectorStore = new VectorStoreService();
