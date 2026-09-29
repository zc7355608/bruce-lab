"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./FileTree.module.css";
import { TreeNode } from "../lib/postsLocal";

interface FileTreeProps {
  nodes: TreeNode[];
  level?: number;
}

export default function FileTree({ nodes, level = 0 }: FileTreeProps) {
  return (
    <ul className={styles.tree} style={{ paddingLeft: level > 0 ? "1.2rem" : 0 }}>
      {nodes.map((node) => (
        <FileTreeNode key={node.path} node={node} level={level} />
      ))}
    </ul>
  );
}

function FileTreeNode({ node, level }: { node: TreeNode; level: number }) {
  const [expanded, setExpanded] = useState(false); // 默认全部折叠

  if (node.isFile) {
    const fileName = node.name.replace(/\.md$/, "");
    return (
      <li className={styles.fileNode}>
        <Link href={`/posts/${node.path.replace(/\.md$/, "")}`} className={styles.fileLink}>
          <span className={styles.icon}>📄</span>
          <span className={styles.fileName}>{fileName}</span>
        </Link>
      </li>
    );
  }

  return (
    <li className={styles.dirNode}>
      <button
        className={styles.dirButton}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span className={`${styles.arrow} ${expanded ? styles.arrowExpanded : ""}`}>▶</span>
        <span className={styles.icon}>{expanded ? "📂" : "📁"}</span>
        <span className={styles.dirName}>{node.name}</span>
      </button>
      {expanded && node.children && (
        <FileTree nodes={node.children} level={level + 1} />
      )}
    </li>
  );
}