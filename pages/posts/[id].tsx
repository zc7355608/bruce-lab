import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';

import Layout from '../../components/layout/index';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';

import { getMdFiles, getPostData } from '../../lib/posts';
import { githubPathToId } from '../../lib/common';

export default function Post({
  postData,
}: {
  postData: {
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

// 该函数执行时机与getStaticProps类似的。它是为动态路由页面（如 [id].tsx）设计的。它的主要作用是告诉 Next.js 需要预渲染哪些路径。
export const getStaticPaths: GetStaticPaths = async () => {
  const files = await getMdFiles('JS');
  const paths = files.map((file) => ({
    params: {
      id: file.id || '',
      download_url: file.download_url || '',
    },
  }));

  return {
    paths,
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
export const getStaticProps: GetStaticProps = async (
    {
      params,
    }: {
      params: { id: string; download_url: string };
    }
  ) => {
  // console.log(params.id);
  // console.log(params.download_url);

  const promiseArr: Promise<any>[] = [];
  files.forEach((file) => {
    file.download_url && promiseArr.push(getPostData({
      id: githubPathToId(file.path ?? ''),
      title: file.name,
      date: new Date().toISOString().split('T')[0],
      download_url: file.download_url,
    }));
  });

  const result = await Promise.allSettled(promiseArr);
  result.forEach((item) => {
    if (item.status === 'rejected') {
      console.error('Error fetching post data:', item.reason);
    }
  });

  return {
    props: {
      postData,
    },
  };
};
