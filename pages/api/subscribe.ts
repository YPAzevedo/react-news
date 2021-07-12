import { query } from 'faunadb';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

import { COLLECTIONS, fauna, INDEXES } from '../../services/fauna';
import { stripe } from '../../services/stripe';

import type { User } from '../../services/fauna';

export default async function subscribeHandler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    const session = await getSession({ req: request });
    const email = session?.user?.email ?? '';

    // Get user by email
    const user = await fauna.query<User>(
      query.Get(
        query.Match(query.Index(INDEXES.USERS_BY_EMAIL), query.Casefold(email))
      )
    );

    // if theres user get the id from faunadb
    // if not, create a new user on stripe and get if from there
    const stripeCustomerId =
      user.data.customerId ||
      (
        await stripe.customers.create({
          email,
        })
      ).id;

    // update user
    await fauna.query<User>(
      query.Update(
        query.Ref(query.Collection(COLLECTIONS.USERS), user.ref.id),
        {
          data: { customerId: stripeCustomerId },
        }
      )
    );

    // create checkout session for subscription on stripe
    const stripeCheckout = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [{ price: 'price_1JBkkMLOomk4nDjKMf0CKRxQ', quantity: 1 }],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL ?? '',
      cancel_url: process.env.STRIPE_CANCEL_URL ?? '',
    });

    return response.status(200).json({ sessionId: stripeCheckout.id });
  } else {
    response.setHeader('Allow', 'POST');
    response.status(405).send('Method not allowed');
  }
}
