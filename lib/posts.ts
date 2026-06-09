import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

import { githubPathToId, lastModifyDate } from './common';

const OWNER = process.env.GITHUB_OWNER || '';
const REPO = process.env.GITHUB_REPO || '';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const TOKEN = process.env.GITHUB_TOKEN || '';

/*
  {
    name: 'JS',
    path: 'JS',
    sha: '03fed8e89e59aa89dd89085073aaa70c51f0c65f',
    size: 0,
    url: 'https://api.github.com/repos/zc7355608/blogs/contents/JS?ref=main',
    html_url: 'https://github.com/zc7355608/blogs/tree/main/JS',
    git_url: 'https://api.github.com/repos/zc7355608/blogs/git/trees/03fed8e89e59aa89dd89085073aaa70c51f0c65f',
    download_url: null,
    type: 'dir',
    _links: {
      self: 'https://api.github.com/repos/zc7355608/blogs/contents/JS?ref=main',
      git: 'https://api.github.com/repos/zc7355608/blogs/git/trees/03fed8e89e59aa89dd89085073aaa70c51f0c65f',
      html: 'https://github.com/zc7355608/blogs/tree/main/JS'
    }
  },
  {
    name: 'README.md',
    path: 'README.md',
    sha: '5489aef22b971d5237ca8eaaf73ebbea8cb8a62e',
    size: 24,
    url: 'https://api.github.com/repos/zc7355608/blogs/contents/README.md?ref=main',
    html_url: 'https://github.com/zc7355608/blogs/blob/main/README.md',
    git_url: 'https://api.github.com/repos/zc7355608/blogs/git/blobs/5489aef22b971d5237ca8eaaf73ebbea8cb8a62e',
    download_url: 'https://raw.githubusercontent.com/zc7355608/blogs/main/README.md',
    type: 'file',
    _links: {
      self: 'https://api.github.com/repos/zc7355608/blogs/contents/README.md?ref=main',
      git: 'https://api.github.com/repos/zc7355608/blogs/git/blobs/5489aef22b971d5237ca8eaaf73ebbea8cb8a62e',
      html: 'https://github.com/zc7355608/blogs/blob/main/README.md'
    }
  },
 */
export interface MdFileInfo {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

/**
 * 构建 GitHub API 专用请求头 (用于 /contents, /commits 等)
 */
function getApiHeaders() {
  const headers: HeadersInit = {
    // 指定 API 版本，防止未来 GitHub 升级导致接口变动
    'X-GitHub-Api-Version': process.env.GITHUB_API_VERSION || '2026-03-10',
    // GitHub API v3 的 MIME 类型，用于获取仓库目录中的文件信息
    'Accept': 'application/vnd.github.v3+json',
  };
  if (TOKEN) {
    headers['Authorization'] = `Bearer ${TOKEN}`;
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
    headers['Authorization'] = `Bearer ${TOKEN}`;
  }
  return headers;
}

// 封装 fetch 请求，用于获取 GitHub API 数据
export async function githubApiFetch(url: string) {
  const res = await fetch(url, {
    headers: getApiHeaders(),
    // 构建时缓存，避免重复请求（Node环境选项）
    next: { revalidate: 3600 }
  });

  if (!res.ok) throw new Error(`githubApiFetch request failed: ${res.statusText}`);
  return res.json();
}

// 封装 fetch 请求，用于获取原始文件内容
export async function githubRawFetch(url: string) {
  const res = await fetch(url, {
    headers: getRawFileHeaders(),
    // 构建时缓存，避免重复请求（Node环境选项）
    next: { revalidate: 3600 }
  });

  if (!res.ok) throw new Error(`githubRawFetch request failed: ${res.statusText}`);
  return res.text();
}

// 获取指定目录下的所有 .md 文件的信息
export async function getMdFiles(path: string = ''): Promise<{
  id: string;
  title: string;
  date: string;
  download_url: string;
}[]> {
  const formatPath = path.startsWith('/') || path === '' ? path : ('/' + path);
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents${formatPath}?ref=${BRANCH}`;
  const files = await githubApiFetch(url);

  // 过滤出 .md 文件，并封装基本信息对象
  const posts = files
    .filter((file: any) => file.type === 'file' && file.name.endsWith('.md'))
    .map((file: any) => ({
      id: githubPathToId(file.path ?? ''),
      title: file.name,
      date: lastModifyDate(),
      download_url: file.download_url || '',
  }));

  return posts;
}

// 根据download_url获取单篇md文档的内容
export async function getPostData(mdInfo: {
  id: string;
  title: string;
  date: string;
  download_url: string;
}) {
  const postData = await githubRawFetch(mdInfo.download_url);

  const matterResult = matter(postData);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id: mdInfo.id,
    contentHtml,
    title: mdInfo.title,
    date: mdInfo.date,
  };
}
