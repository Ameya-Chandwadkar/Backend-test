import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
console.log("pdf function?", typeof pdf);
const { PDFParse } = require("pdf-parse");
console.log("PDFParse:", typeof PDFParse);
