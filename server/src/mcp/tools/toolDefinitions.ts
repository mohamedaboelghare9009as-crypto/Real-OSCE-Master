export const McpToolsDefinition = [
    {
        name: "reveal_info",
        description: "Reveal specific history information to the student.",
        parameters: {
            type: "object",
            properties: {
                category: { type: "string", enum: ["HPI", "PMH", "Meds", "Allergies", "Social", "Family", "ROS"] },
                content: { type: "string", description: "The specific fact revealed from case truth." }
            },
            required: ["category", "content"]
        }
    },
    {
        name: "reveal_finding",
        description: "Reveal physical examination findings.",
        parameters: {
            type: "object",
            properties: {
                system: { type: "string" },
                finding: { type: "string" },
                isAbnormal: { type: "boolean" }
            },
            required: ["system", "finding"]
        }
    },
    {
        name: "reveal_result",
        description: "Reveal investigation results (labs/imaging).",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string" },
                result: { type: "string" },
                abnormal: { type: "boolean" }
            },
            required: ["name", "result"]
        }
    },
    {
        name: "deny_request",
        description: "Deny a request if it is invalid, forbidden, or data is missing.",
        parameters: {
            type: "object",
            properties: {
                reason: { type: "string" }
            },
            required: ["reason"]
        }
    },
    {
        name: "progress_stage",
        description: "Move the session to the next stage.",
        parameters: {
            type: "object",
            properties: {
                nextStage: { type: "string", enum: ["Examination", "Investigations", "Management", "End"] }
            },
            required: ["nextStage"]
        }
    }
];
