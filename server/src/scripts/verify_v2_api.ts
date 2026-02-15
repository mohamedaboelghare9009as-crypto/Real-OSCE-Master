
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

async function verify() {
    try {
        console.log("1. Fetching All Cases...");
        const listRes = await axios.get(`${BASE_URL}/cases`);
        const cases = listRes.data;
        const v2Case = cases.find((c: any) => c.title.includes('Persistent Low Mood'));

        if (!v2Case) {
            console.error("FAILED: V2 Case not found in list.");
            console.log("Available cases:", cases.map((c: any) => c.title));
            process.exit(1);
        }

        console.log("SUCCESS: Found V2 Case in List:", v2Case.id, v2Case.title);
        console.log("Tags:", v2Case.tags); // Should be learning_objectives

        console.log("2. Fetching Case Details...");
        const detailRes = await axios.get(`${BASE_URL}/cases/${v2Case.id}`);
        const fullCase = detailRes.data.case;

        // Verify Mapping
        if (fullCase.chiefComplaint !== "Feeling empty and tired all the time") {
            console.error("FAILED: Chief Complaint Mismatch.", fullCase.chiefComplaint);
            process.exit(1);
        }

        if (!fullCase.history || !fullCase.history.hpi) {
            console.error("FAILED: History/HPI missing.");
            process.exit(1);
        }

        console.log("SUCCESS: Case Details Mapped Correctly!");
        console.log("Chief Complaint:", fullCase.chiefComplaint);
        console.log("Description (Innovation):", fullCase.description);

        process.exit(0);

    } catch (e: any) {
        console.error("Verification Error:", e.message);
        if (e.response) console.error("Response:", e.response.data);
        process.exit(1);
    }
}

verify();
