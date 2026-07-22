import Link from "next/link";
import Image from "next/image";

import Date from "../../../components/date";
import styles from "../../../components/layout/index.module.css";
import utilStyles from "../../../styles/utils.module.css";
import { getBlogsPath, getPostData } from "../../../lib/postsLocal";
import { MD_SUFFIX } from "../../../lib/constant";
import { lastModifyDate, deleteFileExtension } from "../../../lib/common";

export async function generateStaticParams() {
  const blogTree = await getBlogsPath();
  return blogTree.map((item) => ({
    slug: deleteFileExtension(item).split("/"),
  }));
}

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const id = slug.map(decodeURIComponent).join("/");
  const { contentHtml } = await getPostData(id + MD_SUFFIX);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/">
          <Image
            priority
            src="/images/profile.png"
            className={utilStyles.borderCircle}
            height={108}
            width={108}
            alt="Bruce Wayne"
          />
        </Link>
        <h2 className={utilStyles.headingLg}>
          <Link href="/" className={utilStyles.colorInherit}>
            Bruce Wayne
          </Link>
        </h2>
      </header>
      <main>
        <article className="markdown-body">
          <h1 className={utilStyles.headingXl}>{id + MD_SUFFIX}</h1>
          <div className={utilStyles.lightText}>
            <Date dateString={lastModifyDate()} />
          </div>
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </article>
      </main>
      <Link href="/" className={styles.backToHome}>
        ← 返回主页
      </Link>
    </div>
  );
}
