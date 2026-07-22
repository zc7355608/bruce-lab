import Link from "next/link";
import Image from "next/image";

import Date from "../components/date";
import styles from "../components/layout/index.module.css";
import utilStyles from "../styles/utils.module.css";

import { siteConfig } from "../lib/site-config";
import { getBlogsPath } from "../lib/postsLocal";
import { lastModifyDate, deleteFileExtension } from "../lib/common";

export default async function Home() {
  const blogTree = await getBlogsPath();
  const allPostsData = blogTree.map((item) => ({
    id: deleteFileExtension(item),
    title: item,
    date: lastModifyDate(),
  }));

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
        <section className={utilStyles.headingMd}>
          <p>
            你好，我是一名前端开发者。
            <br />
            这里记录前端开发中的学习笔记与踩坑经历。对于想了解、学习前端技术的人，希望它们能帮到你。
            <br />
            网站灵感来源于 Next.js 中文官网的入门项目，内容存放在 GitHub
            中，随着提交而重新触发页面的构建与部署，以此来保证持续更新。
          </p>
        </section>
        <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <h2 className={utilStyles.headingLg}>我的笔记</h2>
          <ul className={utilStyles.list}>
            {allPostsData.map(({ id, date, title }) => (
              <li className={utilStyles.listItem} key={id}>
                <Link href={`/posts/${id}`}>{title}</Link>
                <br />
                <small className={utilStyles.lightText}>
                  <Date dateString={date} />
                </small>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
