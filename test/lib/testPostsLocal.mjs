import fs from "fs/promises";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");
const MD_SUFFIX = ".md";

async function getBlogsPath() {
  const result = [];

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith(MD_SUFFIX)) {
        result.push(path.relative(CONTENT_DIR, fullPath).replace(/\\/g, "/"));
      }
    }
  }

  await walk(CONTENT_DIR);

  return result;
}

console.log(await getBlogsPath());
