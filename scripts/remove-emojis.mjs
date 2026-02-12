import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(import.meta.dirname, "..", "public", "data");

// 이모지 + 뒤따르는 공백 제거 (Variation Selector 포함)
const EMOJI_REGEX = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]\uFE0F?\s*/gu;

async function processDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      count += await processDir(fullPath);
    } else if (entry.name.endsWith(".md")) {
      const content = await readFile(fullPath, "utf-8");
      const cleaned = content.replace(EMOJI_REGEX, "");
      if (content !== cleaned) {
        await writeFile(fullPath, cleaned, "utf-8");
        const removed = content.length - cleaned.length;
        console.log(`${fullPath.replace(DATA_DIR + "/", "")}: ${removed}자 제거`);
        count++;
      }
    }
  }
  return count;
}

const total = await processDir(DATA_DIR);
console.log(`\n총 ${total}개 파일 처리 완료`);
