// server/src/services/conversationalHandler.ts
import { OsceCaseV2 } from "../schemas/caseSchema";

export type ConversationalHandlerResult = string;

export const conversationalHandler = {
  /**
   * Matches PatientService usage:
   * conversationalHandler.generateResponse(message, osceCase)
   */
  async generateResponse(_message: string, _osceCase: OsceCaseV2): Promise<ConversationalHandlerResult> {
    return "OK";
  }
};
