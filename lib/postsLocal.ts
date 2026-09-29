import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

import { MD_SUFFIX } from "./constant";
import { remarkCopyImg } from "./remark-plugin-img";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
  isFile: boolean;
}

export function buildFileTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const filePath of paths) {
    const parts = filePath.split("/");
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join("/");

      let existingNode = currentLevel.find((node) => node.name === part);

      if (!existingNode) {
        existingNode = {
          name: part,
          path: currentPath,
          isFile: isLast,
          ...(isLast ? {} : { children: [] }),
        };
        currentLevel.push(existingNode);
      }

      if (!isLast && existingNode.children) {
        currentLevel = existingNode.children;
      }
    }
  }

  // 排序：目录在前，文件在后，同级按名称字母排序
  function sortTree(nodes: TreeNode[]): TreeNode[] {
    return nodes
      .sort((a, b) => {
        if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
        return a.name.localeCompare(b.name);
      })
      .map((node) => ({
        ...node,
        ...(node.children ? { children: sortTree(node.children) } : {}),
      }));
  }

  return sortTree(root);
}

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

  const processedContent = await remark()
    .use(remarkCopyImg, {
      publicDir: path.join(process.cwd(), 'public'),
      outputDir: '/images/blog',
      mdFilePath: fullPath
    })
    .use(html)
    .process(matterResult.content);

  return {
    contentHtml: processedContent.toString(),
    frontData: matterResult.data,
  };
}
