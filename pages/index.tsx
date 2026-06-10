import Head from "next/head";
import Link from "next/link";
import { GetStaticProps } from "next";

import Layout from "../components/layout/index";
import Date from "../components/date";

import utilStyles from "../styles/utils.module.css";
import { siteConfig } from "../lib/site-config";
import { getBlogsRepoTree } from "../lib/posts";
import { lastModifyDate, deleteFileExtension } from "../lib/common";

export default function Home({
  allPostsData,
}: {
  allPostsData: {
    date: string;
    title: string;
    id: string;
  }[];
}) {
  return (
    <Layout home>
      <Head>
        <title>{siteConfig.siteTitle}</title>
      </Head>
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
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const blogTree = await getBlogsRepoTree();
  const allPostsData = blogTree.map((item) => ({
    id: deleteFileExtension(item.path),
    title: item.path,
    date: lastModifyDate(), // todo: 日期改为github中的最近修改时间
  }));

  return {
    props: {
      allPostsData,
    },
  };
};
