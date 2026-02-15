
import { FactResult } from '../types';

export class ResponseFormatter {

    format(fact: FactResult): string {
        if (!fact.found) {
            return "I'm not exactly sure what you're asking about. Can you be more specific?";
        }

        // Potential for future LLM polishing here (e.g. "Fact -> Persona-Laden Response")
        // For strict determinism, we return the raw fact text with minimal wrapping.

        return fact.fact;
    }

    formatBlock(reason: string): string {
        return reason;
    }

    formatError(): string {
        return "I'm feeling a bit confused. Can we start over?"; // In-world error
    }
}
