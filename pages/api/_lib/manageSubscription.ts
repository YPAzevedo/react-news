import { query } from 'faunadb';
import { COLLECTIONS, fauna, INDEXES } from '../../../services/fauna';
import { stripe } from '../../../services/stripe';

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  action: 'create' | 'update' = 'create'
) {
  try {
    const userRef = await fauna.query(
      query.Select(
        'ref',
        query.Get(
          query.Match(query.Index(INDEXES.USERS_BY_CUSTOMER_ID), customerId)
        )
      )
    );
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionData = {
      id: subscription.id,
      userId: userRef,
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
    };

    if (action === 'create') {
      // Create subscription depending ont the kind of event
      await fauna.query(
        query.Create(query.Collection(COLLECTIONS.SUBSCRIPTIONS), {
          data: subscriptionData,
        })
      );
    } else {
      // Replace subscription data for the given subscription
      await fauna.query(
        query.Replace(
          query.Select(
            'ref',
            query.Get(
              query.Match(
                query.Index(INDEXES.SUBSCRIPTIONS_BY_ID),
                subscriptionId
              )
            )
          ),
          {
            data: subscriptionData,
          }
        )
      );
    }
  } catch (err) {
    console.warn(err.message);
  }
}
