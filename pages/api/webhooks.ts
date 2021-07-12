import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import Stripe from 'stripe';

import { stripe } from '../../services/stripe';
import { saveSubscription } from './_lib/manageSubscription';

async function streamBuffer(readable: Readable) {
  const chunks: Buffer[] = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk);
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const events = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export default async function subscribeHandler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    const buffer = await streamBuffer(request);
    const secret = request.headers['stripe-signature'] ?? '';

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buffer,
        secret,
        process.env.STRIPE_WEBHOOK_SECRET ?? ''
      );
    } catch (err) {
      return response.status(400).send('Stripe webhook error: ' + err.message);
    }

    const { type } = event;

    if (events.has(type)) {
      try {
        switch (type) {
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;

            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              'update'
            );

            break;
          }
          case 'checkout.session.completed': {
            const checkoutSession = event.data
              .object as Stripe.Checkout.Session;

            await saveSubscription(
              checkoutSession.subscription?.toString() ?? '',
              checkoutSession.customer?.toString() ?? '',
              'create'
            );
            break;
          }
          default:
            throw new Error(`Unsupported event type: ${type}`);
        }
      } catch (err) {
        return response.send(`Webhook error - event: ${type} - ${err.message}`);
      }
    }

    response.json({ recieved: 'OK' });
  } else {
    response.setHeader('Allow', 'POST');
    response.status(405).send('Method not allowed');
  }
}
