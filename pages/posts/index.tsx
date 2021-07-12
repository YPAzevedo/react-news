import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../../services/prismic';

import styles from './posts.module.scss';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
};

type PostProps = {
  posts: Post[];
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const { results: remotePosts } = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.content'],
      pageSize: 100,
    }
  );

  const posts = remotePosts.map((post) => ({
    slug: post.uid,
    title: RichText.asText(post.data.title),
    // Find fist paragraph for preview
    excerpt:
      post.data.content.find(
        (content: { type: string }) => content.type === 'paragraph'
      )?.text ?? '',
    updatedAt: new Date(post.last_publication_date ?? '').toLocaleDateString(
      // format date on serverside
      'en-US',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    ),
  }));

  return {
    props: { posts },
  };
};

export default function Posts({ posts }: PostProps) {
  return (
    <>
      <Head>
        <title>Posts | News</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map((post) => (
            <Link key={post.slug} href="#" passHref>
              <a className={styles.title}>
                <time>September 12, 2021</time>
                <strong>Lorem Ipsum</strong>
                <p>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry`s
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book
                </p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
