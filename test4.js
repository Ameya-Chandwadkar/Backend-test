import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

try {
    const parser = new PDFParse();
    console.log(typeof parser.getText);
} catch (e) {
    console.error(e.message);
}
