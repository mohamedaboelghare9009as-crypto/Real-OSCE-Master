
export class ResponseMapper {
    map(text: string): { text: string, emotion?: string } {
        // Future: Emotional analysis based on text content or case state
        // For now: Pass through
        return {
            text: text,
            emotion: 'neutral'
        };
    }
}

export const responseMapper = new ResponseMapper();
