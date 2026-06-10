import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

import { MD_SUFFIX } from "./constant";

const CONTENT_DIR = path.join(process.cwd(), "content");

export async function getBlogsPath(): Promise<string[]> {
  const result: string[] = [];

  async function walk(dir: string) {
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

export async function getPostData(relativePath: string) {
  const fullPath = path.join(CONTENT_DIR, relativePath);

  const postData = await fs.readFile(fullPath, "utf-8");

  const matterResult = matter(postData);
  console.log(matterResult);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);

  return {
    contentHtml: processedContent.toString(),
    frontData: matterResult.data,
  };
}
