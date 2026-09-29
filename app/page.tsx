import Image from "next/image";

import styles from "../components/layout/index.module.css";
import utilStyles from "../styles/utils.module.css";

import { getBlogsPath, buildFileTree } from "../lib/postsLocal";
import FileTree from "../components/FileTree";

export default async function Home() {
  const blogPaths = await getBlogsPath();
  const fileTree = buildFileTree(blogPaths);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Image
          priority
          src="/images/profile.png"
          className={utilStyles.borderCircle}
          height={144}
          width={144}
          alt="Bruce Wayne"
        />
        <h1 className={utilStyles.heading2Xl}>Bruce Wayne</h1>
      </header>
      <main>
        <div className={styles.bio}>
          你好，我是一名前端开发者。这里记录前端开发中的学习笔记与踩坑经历。对于想了解、学习前端技术的人，希望它们能帮到你。
          <br />
          网站灵感来源于 Next.js 中文官网的入门项目，内容存放在 GitHub
          中，随着提交而重新触发页面的构建与部署，以此来保证持续更新。
        </div>
        <section>
          <h2 className={styles.sectionTitle}>我的笔记</h2>
          <div className={styles.postListScroll}>
            <FileTree nodes={fileTree} />
          </div>
        </section>
      </main>
    </div>
  );
}
