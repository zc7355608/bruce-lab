import { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";

import Layout from "../../components/layout/index";
import Date from "../../components/date";

import utilStyles from "../../styles/utils.module.css";
import { getBlogsPath, getPostData } from "../../lib/postsLocal";
import { MD_SUFFIX } from "../../lib/constant";
import { lastModifyDate, deleteFileExtension } from "../../lib/common";

export default function Post({
  postData,
}: {
  postData: {
    id: string;
    title: string;
    date: string;
    contentHtml: string;
  };
}) {
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </Layout>
  );
}

// 该函数执行时机与getStaticProps类似的，并且一定是先执行的。它是为动态路由页面（如 [id].tsx）设计的。它的主要作用是告诉 Next.js 需要预渲染哪些路径。
export const getStaticPaths: GetStaticPaths = async () => {
  const blogTree = await getBlogsPath();
  const allPostsData = blogTree.map((item) => ({
    id: deleteFileExtension(item),
    title: item,
    date: lastModifyDate(), // todo: 日期改为git的最近修改时间
  }));

  return {
    paths: allPostsData.map((post) => ({
      params: { slug: post.id.split("/") }, // 需要将路径分割成数组形式，以匹配 [...slug].tsx 中的动态路由参数
    })),
    fallback: false, // 为false时，getStaticPaths未返回的任何路径都将导致404页面
  };
};

/**
 * 该函数在构建该页面时执行，且只能在服务器端运行。
 * 生产模式下，该函数会在每次构建时执行；开发模式下，getStaticProps会在每个请求上运行。
 * 该函数只能在 page/ 目录下的页面中使用，不能在非页面组件中使用。
 * @param param0
 * @returns 包含props属性的对象，props也是一个对象，其中的K、V会作为props传给当前组件
 */
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = (params!.slug as string[]).join("/"); // 将路径数组重新拼接成字符串形式，以获取正确的文件路径
  const { contentHtml } = await getPostData(id + MD_SUFFIX); // 需要加上.md后缀才能正确获取到文件内容
  return {
    props: {
      postData: {
        id,
        title: id + MD_SUFFIX,
        date: lastModifyDate(), // todo: 日期改为git的最近修改时间
        contentHtml,
      },
    },
  };
};
