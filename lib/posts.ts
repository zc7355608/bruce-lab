import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

import { deleteFileExtension, lastModifyDate } from "./common";
import { MD_SUFFIX } from "./constant";

const OWNER = process.env.GITHUB_OWNER || "";
const REPO = process.env.GITHUB_REPO || "";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_V3_TYPE = "application/vnd.github.v3+json";

export interface MdFileInfo {
  name: string; // 'Bootstrap.md'
  path: string; // 'JS/Bootstrap.md'
  sha: string;
  size: number; // type为dir时size为0，type为file时size为文件大小
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null; // type为dir时download_url为null，type为file时download_url为文件的raw链接
  type: "file" | "dir";
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export interface RepoTreeItem {
  path: string; // 'CSS/Bootstrap.md'
  mode: string; // 040000 代表目录，100644 代表文件
  type: "blob" | "tree";
  sha: string;
  size?: number; // 只有 type 为 'blob' 时才有 size 属性
  url: string;
}

export interface RepoTree {
  sha: string;
  url: string;
  truncated: boolean; // 如果仓库极大（超过10万个文件），truncated 会为 true，表示数据被截断
  tree: RepoTreeItem[];
}

/**
 * 构建 GitHub API 专用请求头 (用于 /contents, /commits 等)
 */
function getApiHeaders() {
  const headers: HeadersInit = {
    // 指定 API 版本，防止未来 GitHub 升级导致接口变动
    "X-GitHub-Api-Version": process.env.GITHUB_API_VERSION || "2026-03-10",
    // GitHub API v3 的 MIME 类型，用于获取仓库目录中的文件信息
    Accept: GITHUB_V3_TYPE,
  };
  if (TOKEN) {
    headers["Authorization"] = `Bearer ${TOKEN}`;
  }
  return headers;
}

/**
 * 构建 Raw 文件下载专用请求头 (用于 download_url)
 */
function getRawFileHeaders() {
  const headers: HeadersInit = {};
  if (TOKEN) {
    // 依然带上 Token 以享受 5000次/小时 的速率限制
    headers["Authorization"] = `Bearer ${TOKEN}`;
  }
  return headers;
}

// 封装 fetch 请求，用于获取 GitHub API 数据
export async function githubApiFetch(url: string) {
  const res = await fetch(url, {
    headers: getApiHeaders(),
    // 构建时缓存，避免重复请求（Node环境选项）
    next: { revalidate: 3600 },
  });

  if (!res.ok)
    throw new Error(`githubApiFetch request failed: ${res.statusText}`);
  return res.json();
}

// 封装 fetch 请求，用于获取原始文件内容
export async function githubRawFetch(url: string) {
  const res = await fetch(url, {
    headers: getRawFileHeaders(),
    // 构建时缓存，避免重复请求（Node环境选项）
    next: { revalidate: 3600 },
  });

  if (!res.ok)
    throw new Error(`githubRawFetch request failed: ${res.statusText}`);
  return res.text();
}

// 获取指定目录下的所有 .md 文件的信息。默认空串，获取github仓库中所有的md文件
export async function getMdFiles(path: string = ""): Promise<
  {
    id: string;
    title: string;
    date: string;
    download_url: string;
  }[]
> {
  const formatPath = path.startsWith("/") || path === "" ? path : "/" + path;
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents${formatPath}?ref=${BRANCH}`;
  const files = await githubApiFetch(url);

  // 过滤出 .md 文件，并封装基本信息对象
  const posts = files
    .filter(
      (file: any) => file.type === "file" && file.name.endsWith(MD_SUFFIX),
    )
    .map((file: any) => ({
      id: deleteFileExtension(file.path), // 不能包含【/】，不能包含【.】，或其他特殊的字符
      title: file.name,
      date: lastModifyDate(),
      download_url: file.download_url || "", // 暂时没用到
    }));

  return posts;
}

export async function getBlogsRepoTree(): Promise<RepoTreeItem[]> {
  // 使用 Git Trees API 获取 blogs 仓库的文件树 (recursive=1 表示递归获取所有子目录)
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`;
  const res: RepoTree = await githubApiFetch(url);

  // 如果仓库极大（超过10万个文件），truncated 会为 true，表示数据被截断
  if (res.truncated) {
    console.warn("警告：仓库文件过多，文件树被截断，可能无法获取所有 md 文件");
  }

  // 返回所有的 .md 文件（type为blob且路径以.md结尾）
  return res.tree.filter(
    (item: RepoTreeItem) =>
      item.type === "blob" && item.path.endsWith(MD_SUFFIX),
  );
}

// 根据github仓库中的文件路径（开头不要加/）获取单篇md文档的内容
export async function getPostData(filePath: string) {
  const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${filePath}`;
  const postData = await githubRawFetch(url);

  const matterResult = matter(postData);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);

  return processedContent.toString();
}
