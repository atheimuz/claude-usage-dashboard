import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { parseDailyReport } from "./parser.ts";
import type { FileEntry } from "../src/types/index.ts";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..");
const DATA_DIR = resolve(ROOT, "public/data");

const indexPath = resolve(DATA_DIR, "index.json");
const indexData = JSON.parse(readFileSync(indexPath, "utf-8"));
const files: FileEntry[] = indexData.files;

let converted = 0;
let failed = 0;

for (const entry of files) {
    const baseName = entry.name.replace(/\.(md|json)$/, "");
    const mdPath = resolve(DATA_DIR, entry.location, baseName + ".md");
    const jsonPath = resolve(DATA_DIR, entry.location, baseName + ".json");
    const filePath = `${entry.location}/${baseName}.md`;

    try {
        const md = readFileSync(mdPath, "utf-8");
        const report = parseDailyReport(md, filePath);
        mkdirSync(dirname(jsonPath), { recursive: true });
        writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf-8");
        console.log(`  ${filePath} -> ${entry.location}/${baseName}.json`);
        converted++;
    } catch (e) {
        console.error(`  ${filePath} 변환 실패:`, (e as Error).message);
        failed++;
    }
}

const updatedFiles = files.map((f) => ({
    ...f,
    name: f.name.replace(/\.(md|json)$/, "") + ".json",
}));
writeFileSync(
    indexPath,
    JSON.stringify({ files: updatedFiles }, null, 4) + "\n",
    "utf-8"
);

console.log(`\n완료: ${converted}개 변환, ${failed}개 실패`);
console.log("index.json 업데이트 완료 (.md -> .json)");
