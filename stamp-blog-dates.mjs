// 為 publishDate 留空 ("") 的知識庫文章填入「今天」的真實日期（台灣時區）
// 使用方式：新增文章時把 publishDate 留空，執行 `npm run stamp`
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(__dirname, "../src/data/blogPosts.ts");

const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const src = fs.readFileSync(file, "utf8");
let count = 0;
const out = src.replace(/publishDate:\s*""/g, () => {
  count++;
  return `publishDate: "${today}"`;
});

if (count) fs.writeFileSync(file, out);
console.log(count ? `已為 ${count} 篇文章填入發布日期 ${today}` : "沒有需要填入日期的文章。");
