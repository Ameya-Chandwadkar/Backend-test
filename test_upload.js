import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch"; // Node 18+ has native fetch, but form-data might need special handling

async function run() {
    const form = new FormData();
    form.append("uploaderName", "Test User");
    form.append("uploaderEmail", "test@test.com");
    // Create a dummy PDF buffer
    const buf = Buffer.from("%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n/Resources <<\n/Font <<\n/F1 5 0 R\n>>\n>>\n>>\nendobj\n4 0 obj\n<< /Length 51 >>\nstream\nBT\n/F1 12 Tf\n72 712 Td\n(Hello World) Tj\nET\nendstream\nendobj\n5 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000219 00000 n \n0000000320 00000 n \ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n408\n%%EOF");
    form.append("resume", buf, { filename: "test.pdf", contentType: "application/pdf" });

    try {
        const res = await fetch("http://localhost:4000/api/v1/resumes/upload", {
            method: "POST",
            body: form
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
