
import axios from 'axios';

async function run() {
    try {
        const caseId = '69680b570400b00bf299fd72';
        const res = await axios.get(`http://localhost:3001/api/cases/${caseId}`);
        console.log("Case Truth:", JSON.stringify(res.data.case.truth, null, 2));
    } catch (e) {
        console.error(e);
    }
}
run();
