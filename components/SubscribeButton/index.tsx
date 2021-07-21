import { signIn, useSession } from 'next-auth/client';
import { api } from '../../services/api';
import { getStripeClient } from '../../services/stripe.client';
import styles from './subscribebutton.module.scss';

type SubscribebuttonProps = {
  priceId: string;
};

export function SubscribeButton({ priceId }: SubscribebuttonProps) {
  const [session] = useSession();

  async function handleSubscribe() {
    if (!session) {
      return signIn('github');
    }

    try {
      const response = await api.post('/subscribe');

      const { sessionId } = response.data;

      const stripeClient = await getStripeClient();

      stripeClient?.redirectToCheckout({ sessionId });
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <button type="button" className={styles.button} onClick={handleSubscribe}>
      Subscribe now
    </button>
  );
}
