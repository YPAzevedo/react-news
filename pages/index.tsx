import { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';

import { SubscribeButton } from '../components/SubscribeButton';
import { stripe } from '../services/stripe';

import styles from './home.module.scss';

type HomeProps = {
  product: {
    priceId: string;
    amount: string;
  };
};

export const getStaticProps: GetStaticProps = async () => {
  const subscriptionPrice = await stripe.prices.retrieve(
    'price_1JBkkMLOomk4nDjKMf0CKRxQ'
  );

  const product = {
    priceId: subscriptionPrice.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format((subscriptionPrice.unit_amount ?? 0) / 100),
  };

  return {
    props: { product },
    revalidate: 60 * 60 * 24, // one day
  };
};

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | News</title>
      </Head>
      <main className={styles.container}>
        <section className={styles.hero}>
          <span>👋 Hey, welcome</span>

          <h1>
            News about the <span>React</span> world
          </h1>

          <p>
            Get access to all publucations
            <br />
            <span>for {product.amount} per month</span>
          </p>

          <SubscribeButton priceId={product.priceId} />
        </section>

        <Image
          src="/images/avatar.svg"
          alt="Girl Coding"
          width="500"
          height="500"
        />
      </main>
    </>
  );
}
