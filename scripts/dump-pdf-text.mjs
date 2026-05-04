import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PDFParse } from "pdf-parse";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pdfPath = "C:/Users/USER/Downloads/تعديلات.pdf";

const data = readFileSync(pdfPath);
const parser = new PDFParse({ data });
const textResult = await parser.getText();
await parser.destroy();

const out = join(root, "_pdf-out.txt");
writeFileSync(out, textResult.text, "utf8");
console.log("wrote", out, "pages", textResult.total);
